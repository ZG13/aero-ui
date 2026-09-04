<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import AeroIcon from '../../icon/src/Icon.vue';
import { useLocale } from '../../../hooks';
import { decadeStart, parseDate } from './date';
import DateTable from './DateTable.vue';
import MonthTable from './MonthTable.vue';
import YearTable from './YearTable.vue';
import type { DatePickerShortcut } from '../types';

defineOptions({ name: 'AeroDatePanel' });

// 单日历面板：视图三态切换（date/month/year）、四向导航、shortcuts、footer「今天」。
// 对齐 element-plus panel-date-pick：月份导航由面板 header 承担，表格仅负责网格。
const props = withDefaults(
  defineProps<{
    modelValue?: Dayjs | null;
    /** 面板开合（打开时重置视图与定位月） */
    visible?: boolean;
    defaultValue?: Dayjs | null;
    disabledDate?: (date: Date) => boolean;
    cellClassName?: (date: Date) => string;
    firstDayOfWeek?: number;
    shortcuts?: DatePickerShortcut[];
    /** 键盘导航聚焦日期（跨月时带动面板翻页） */
    focusedDate?: Dayjs | null;
  }>(),
  {
    modelValue: null,
    visible: false,
    defaultValue: null,
    firstDayOfWeek: 7,
    focusedDate: null,
  },
);

const emit = defineEmits<{
  /** 选中日期（含「今天」与快捷项），序列化由触发器层负责 */
  (e: 'select', day: Dayjs): void;
  (e: 'panel-change', date: Date, mode: 'date' | 'month' | 'year', view: 'date' | 'month' | 'year'): void;
}>();

const { t, tm, locale } = useLocale();

type PanelView = 'date' | 'month' | 'year';
const view = ref<PanelView>('date');
const currentMonth = ref<Dayjs>(dayjs());

// 打开时重置：定位到选中值 / defaultValue / 今天
watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    currentMonth.value = (props.modelValue ?? props.defaultValue ?? dayjs()).startOf('month');
    view.value = 'date';
  },
  { immediate: true },
);

// 键盘导航跨月时带动面板翻页
watch(
  () => props.focusedDate,
  (focused) => {
    if (view.value !== 'date' || !focused) return;
    if (focused.month() !== currentMonth.value.month() || focused.year() !== currentMonth.value.year()) {
      currentMonth.value = focused.startOf('month');
    }
  },
);

const yearText = computed(() =>
  locale.value === 'zh-cn'
    ? `${currentMonth.value.year()}${t('components.datePicker.year')}`
    : `${currentMonth.value.year()}`,
);

const monthText = computed(() =>
  locale.value === 'zh-cn'
    ? `${currentMonth.value.month() + 1}${t('components.datePicker.month')}`
    : currentMonth.value.format('MMMM'),
);

const decadeText = computed(() => {
  const start = decadeStart(currentMonth.value.year());
  return `${start} - ${start + 9}`;
});

// 月/周标签随语言切换
const monthLabels = computed(() =>
  locale.value === 'zh-cn'
    ? Array.from({ length: 12 }, (_, i) => `${i + 1}${t('components.datePicker.month')}`)
    : Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM')),
);

const weekdayLabels = computed(() => tm('components.datePicker.weekdays') as string[]);

// —— 导航（面板 header 箭头） ——
function emitPanelChange(): void {
  emit('panel-change', currentMonth.value.toDate(), view.value, view.value);
}

function prevMonth(): void {
  currentMonth.value = currentMonth.value.subtract(1, 'month');
  emitPanelChange();
}

function nextMonth(): void {
  currentMonth.value = currentMonth.value.add(1, 'month');
  emitPanelChange();
}

function prevYear(): void {
  currentMonth.value =
    view.value === 'year' ? currentMonth.value.subtract(10, 'year') : currentMonth.value.subtract(1, 'year');
  emitPanelChange();
}

function nextYear(): void {
  currentMonth.value =
    view.value === 'year' ? currentMonth.value.add(10, 'year') : currentMonth.value.add(1, 'year');
  emitPanelChange();
}

// —— 视图切换 ——
function showMonthView(): void {
  view.value = 'month';
  emitPanelChange();
}

function showYearView(): void {
  view.value = 'year';
  emitPanelChange();
}

function onMonthSelect(day: Dayjs): void {
  currentMonth.value = day;
  view.value = 'date';
  emitPanelChange();
}

function onYearSelect(day: Dayjs): void {
  currentMonth.value = day.month(currentMonth.value.month());
  view.value = 'month';
  emitPanelChange();
}

// —— 选中 ——
function isDisabled(day: Dayjs): boolean {
  return props.disabledDate ? props.disabledDate(day.toDate()) : false;
}

function onSelect(day: Dayjs): void {
  emit('select', day);
}

function selectToday(): void {
  const today = dayjs();
  if (isDisabled(today)) return;
  emit('select', today);
}

// —— 快捷项 ——
function applyShortcut(shortcut: DatePickerShortcut): void {
  const value = shortcut.value(dayjs());
  if (Array.isArray(value)) return;
  const day = parseDate(value.getTime());
  if (day) emit('select', day);
}
</script>

<template>
  <div class="aero-date-panel">
    <aside v-if="shortcuts?.length" class="aero-date-panel__sidebar">
      <button
        v-for="(shortcut, index) in shortcuts"
        :key="index"
        type="button"
        class="aero-date-panel__shortcut"
        @click="applyShortcut(shortcut)"
      >
        {{ shortcut.text }}
      </button>
    </aside>

    <div class="aero-date-panel__main">
      <header class="aero-date-panel__header">
        <button type="button" class="aero-date-panel__nav" @click="prevYear">
          <AeroIcon name="d-arrow-left" :size="12" />
        </button>
        <button
          v-if="view === 'date'"
          type="button"
          class="aero-date-panel__nav"
          @click="prevMonth"
        >
          <AeroIcon name="arrow-left" :size="12" />
        </button>

        <div class="aero-date-panel__title">
          <span
            class="aero-date-panel__title-label"
            :class="{ 'is-clickable': view !== 'year' }"
            @click="view !== 'year' && showYearView()"
          >
            {{ view === 'year' ? decadeText : yearText }}
          </span>
          <span
            v-if="view === 'date'"
            class="aero-date-panel__title-label is-clickable"
            @click="showMonthView()"
          >
            {{ monthText }}
          </span>
        </div>

        <button
          v-if="view === 'date'"
          type="button"
          class="aero-date-panel__nav"
          @click="nextMonth"
        >
          <AeroIcon name="arrow-right" :size="12" />
        </button>
        <button type="button" class="aero-date-panel__nav" @click="nextYear">
          <AeroIcon name="d-arrow-right" :size="12" />
        </button>
      </header>

      <div class="aero-date-panel__body">
        <DateTable
          v-if="view === 'date'"
          :month="currentMonth"
          :selected="modelValue"
          :disabled-date="disabledDate"
          :cell-class-name="cellClassName"
          :first-day-of-week="firstDayOfWeek"
          :focused-date="focusedDate"
          :weekdays="weekdayLabels"
          @select="onSelect"
        />
        <MonthTable
          v-else-if="view === 'month'"
          :month="currentMonth"
          :selected="modelValue"
          :disabled-date="disabledDate"
          :cell-class-name="cellClassName"
          :labels="monthLabels"
          @select="onMonthSelect"
        />
        <YearTable
          v-else
          :month="currentMonth"
          :selected="modelValue"
          :disabled-date="disabledDate"
          :cell-class-name="cellClassName"
          @select="onYearSelect"
        />
      </div>

      <footer class="aero-date-panel__footer">
        <button type="button" class="aero-date-panel__footer-btn" @click="selectToday">
          {{ t('components.datePicker.today') }}
        </button>
      </footer>
    </div>
  </div>
</template>
