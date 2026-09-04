<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import AeroIcon from '../../icon/src/Icon.vue';
import { useLocale } from '../../../hooks';
import { parseDate } from './date';
import { useRangeSelection } from './panel';
import DateTable from './DateTable.vue';
import type { DatePickerShortcut } from '../types';

defineOptions({ name: 'AeroDateRangePanel' });

// 双日历范围面板：对齐 element-plus panel-date-range。
// 左右日历保持相邻（unlink-panels 可独立），选择状态机为
// 点击 start → hover 实时预览 → 点击 end 完成；无 footer。
const props = withDefaults(
  defineProps<{
    /** 已确认范围（受控） */
    modelValue?: [Dayjs | null, Dayjs | null];
    visible?: boolean;
    defaultValue?: Dayjs | null;
    disabledDate?: (date: Date) => boolean;
    cellClassName?: (date: Date) => string;
    firstDayOfWeek?: number;
    shortcuts?: DatePickerShortcut[];
    /** 左右日历是否互相独立 @default false */
    unlinkPanels?: boolean;
  }>(),
  {
    modelValue: () => [null, null],
    visible: false,
    defaultValue: null,
    firstDayOfWeek: 7,
    unlinkPanels: false,
  },
);

const emit = defineEmits<{
  /** 完成选择，序列化由触发器层负责 */
  (e: 'select', range: [Dayjs, Dayjs]): void;
  /** 选定起始日期 */
  (e: 'calendar-change', value: [Date, Date | null]): void;
}>();

const { tm } = useLocale();

const leftMonth = ref<Dayjs>(dayjs().startOf('month'));
// 独立模式下右面板的月份；联动模式由 rightMonth computed 始终跟随左面板 + 1 月
const rightMonthIndependent = ref<Dayjs>(dayjs().startOf('month').add(1, 'month'));
const rightMonth = computed(() =>
  props.unlinkPanels ? rightMonthIndependent.value : leftMonth.value.add(1, 'month'),
);

const { displayRange, sync, select, hover } = useRangeSelection({
  onCalendarChange: (start) => {
    const [, end] = displayRange.value;
    emit('calendar-change', [start.toDate(), end?.toDate() ?? null]);
  },
  onComplete: (range) => emit('select', range),
});

// 受控范围同步
watch(
  () => props.modelValue,
  (value) => sync(value ?? [null, null]),
  { immediate: true, deep: true },
);

// 打开时重置：定位到已选起始 / defaultValue / 今天
watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    const [start] = props.modelValue ?? [null, null];
    const base = start ?? props.defaultValue ?? dayjs();
    leftMonth.value = base.startOf('month');
    rightMonthIndependent.value = leftMonth.value.add(1, 'month');
  },
  { immediate: true },
);

const weekdayLabels = computed(() => tm('components.datePicker.weekdays') as string[]);

const rangeStart = computed(() => displayRange.value[0]);
const rangeEnd = computed(() => displayRange.value[1]);

// —— 导航 ——
// 联动模式：左右面板始终保持相邻（element-plus 默认行为）；独立模式：各自移动
function prevMonth(): void {
  leftMonth.value = leftMonth.value.subtract(1, 'month');
}

function nextMonth(): void {
  if (props.unlinkPanels) {
    rightMonthIndependent.value = rightMonthIndependent.value.add(1, 'month');
  } else {
    leftMonth.value = leftMonth.value.add(1, 'month');
  }
}

function prevYear(): void {
  leftMonth.value = leftMonth.value.subtract(1, 'year');
}

function nextYear(): void {
  if (props.unlinkPanels) {
    rightMonthIndependent.value = rightMonthIndependent.value.add(1, 'year');
  } else {
    leftMonth.value = leftMonth.value.add(1, 'year');
  }
}

// —— 选择 ——
function onHover(day: Dayjs | null): void {
  hover(day);
}

function applyShortcut(shortcut: DatePickerShortcut): void {
  const value = shortcut.value(dayjs());
  if (!Array.isArray(value)) return;
  const [start, end] = value.map((d) => parseDate(d.getTime()));
  if (start && end) emit('select', start.isBefore(end, 'day') ? [start, end] : [end, start]);
}
</script>

<template>
  <div class="aero-date-panel is-range">
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
      <div class="aero-date-panel__calendars">
        <!-- 左日历：仅向左导航 -->
        <div class="aero-date-panel__calendar">
          <header class="aero-date-panel__header">
            <button type="button" class="aero-date-panel__nav" @click="prevYear">
              <AeroIcon name="d-arrow-left" :size="12" />
            </button>
            <button type="button" class="aero-date-panel__nav" @click="prevMonth">
              <AeroIcon name="arrow-left" :size="12" />
            </button>
            <div class="aero-date-panel__title">
              <span class="aero-date-panel__title-label is-plain">
                {{ leftMonth.format('YYYY-MM') }}
              </span>
            </div>
            <span v-if="!unlinkPanels" class="aero-date-panel__nav is-placeholder" aria-hidden="true"></span>
          </header>
          <DateTable
            :month="leftMonth"
            :is-range="true"
            :range-start="rangeStart"
            :range-end="rangeEnd"
            :disabled-date="disabledDate"
            :cell-class-name="cellClassName"
            :first-day-of-week="firstDayOfWeek"
            :weekdays="weekdayLabels"
            @select="select"
            @hover="onHover"
          />
        </div>

        <!-- 右日历：仅向右导航 -->
        <div class="aero-date-panel__calendar">
          <header class="aero-date-panel__header">
            <span v-if="!unlinkPanels" class="aero-date-panel__nav is-placeholder" aria-hidden="true"></span>
            <div class="aero-date-panel__title">
              <span class="aero-date-panel__title-label is-plain">
                {{ rightMonth.format('YYYY-MM') }}
              </span>
            </div>
            <button type="button" class="aero-date-panel__nav" @click="nextMonth">
              <AeroIcon name="arrow-right" :size="12" />
            </button>
            <button type="button" class="aero-date-panel__nav" @click="nextYear">
              <AeroIcon name="d-arrow-right" :size="12" />
            </button>
          </header>
          <DateTable
            :month="rightMonth"
            :is-range="true"
            :range-start="rangeStart"
            :range-end="rangeEnd"
            :disabled-date="disabledDate"
            :cell-class-name="cellClassName"
            :first-day-of-week="firstDayOfWeek"
            :weekdays="weekdayLabels"
            @select="select"
            @hover="onHover"
          />
        </div>
      </div>
    </div>
  </div>
</template>
