<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { useFormSize, useFormDisabled } from '../../form/src/use-form';
import { formItemContextKey } from '../../form/src/constants';
import { usePopper, useLocale } from '../../../hooks';
import AeroIcon from '../../icon/src/Icon.vue';
import { parseDate, parseStrict, parseSingleValue, parseRangeValue, formatDate, serializeDate } from './date';
import DatePanel from './DatePanel.vue';
import DateRangePanel from './DateRangePanel.vue';
import type {
  DatePickerProps,
  DatePickerEmits,
  DatePickerSingleValue,
} from '../types';

defineOptions({ name: 'AeroDatePicker' });

// disabled 显式默认 undefined：绕过 Vue 布尔 prop 强转，交由 useFormDisabled 解析
const props = withDefaults(defineProps<DatePickerProps>(), {
  type: 'date',
  format: 'YYYY-MM-DD',
  disabled: undefined,
  readonly: false,
  size: undefined,
  editable: true,
  clearable: false,
  rangeSeparator: '-',
  prefixIcon: 'calendar',
  clearIcon: 'close',
  firstDayOfWeek: 7,
  teleported: true,
  validateEvent: true,
  unlinkPanels: false,
});

const emit = defineEmits<DatePickerEmits>();

// —— 表单上下文集成 ——
const formItemContext = inject(formItemContextKey, undefined);
const inheritedSize = useFormSize(props.size);
const inheritedDisabled = useFormDisabled(props.disabled);

const size = computed(() => inheritedSize.value ?? 'main');
const disabled = computed(() => inheritedDisabled.value);
const inputReadonly = computed(() => !props.editable || props.readonly);

const { t } = useLocale();

const isRange = computed(() => props.type === 'daterange');

// —— 触发器与面板 ref ——
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

// —— 弹层定位 ——
// matchTriggerWidth: false → 面板宽度固定（由日历网格内容决定），不随触发器拉伸
const { open, panelStyle, close, toggle } = usePopper({
  trigger: rootRef,
  panel: panelRef,
  matchTriggerWidth: false,
});

watch(open, (value) => {
  emit('visible-change', value);
});

// —— 日期状态 ——
const selectedDay = computed(() => parseSingleValue(props.modelValue));
const rangeValue = computed(() => parseRangeValue(props.modelValue));

// —— 回显 ——
const displayValue = computed(() => formatDate(selectedDay.value, props.format));

const startDisplay = computed(() => formatDate(rangeValue.value[0], props.format));
const endDisplay = computed(() => formatDate(rangeValue.value[1], props.format));

const hasValue = computed(() =>
  isRange.value ? rangeValue.value.some((d) => d !== null) : selectedDay.value !== null,
);

// —— placeholder（缺省走 locale，对齐 element-plus） ——
const placeholderText = computed(() => props.placeholder ?? t('components.datePicker.datePlaceholder'));
const startPlaceholderText = computed(
  () => props.startPlaceholder ?? t('components.datePicker.startPlaceholder'),
);
const endPlaceholderText = computed(
  () => props.endPlaceholder ?? t('components.datePicker.endPlaceholder'),
);

// —— hover / focus 状态（showClear 判定，对齐 select 与 element-plus） ——
const hovering = ref(false);
const focused = ref(false);

const showClear = computed(
  () => props.clearable && !disabled.value && hasValue.value && (focused.value || hovering.value),
);

// —— 手动输入（editable）：editText 为 null 时显示受控回显 ——
const editText = ref<string | null>(null);
const startEditText = ref<string | null>(null);
const endEditText = ref<string | null>(null);

function onSingleInput(event: Event): void {
  editText.value = (event.target as HTMLInputElement).value;
}

function onStartInput(event: Event): void {
  startEditText.value = (event.target as HTMLInputElement).value;
}

function onEndInput(event: Event): void {
  endEditText.value = (event.target as HTMLInputElement).value;
}

function isDisabled(day: Dayjs): boolean {
  return props.disabledDate ? props.disabledDate(day.toDate()) : false;
}

/** 提交单值输入：解析成功派发，失败/禁用恢复回显 */
function commitSingleEdit(): void {
  const text = editText.value ?? '';
  editText.value = null;
  if (!text.trim()) return;
  const day = parseStrict(text, props.format);
  if (!day || isDisabled(day)) return;
  // 与当前值相同则只恢复显示，不重复派发
  if (selectedDay.value?.isSame(day, 'day')) return;
  selectValue(day);
}

/** 提交范围输入：两个输入均有效时派发，否则整体恢复回显 */
function commitRangeEdit(): void {
  const startText = startEditText.value;
  const endText = endEditText.value;
  startEditText.value = null;
  endEditText.value = null;
  if (!startText?.trim() && !endText?.trim()) return;
  const start = parseStrict(startText ?? '', props.format);
  const end = parseStrict(endText ?? '', props.format);
  if (!start || !end) return;
  const range: [Dayjs, Dayjs] = start.isBefore(end, 'day') ? [start, end] : [end, start];
  const [currentStart, currentEnd] = rangeValue.value;
  if (
    currentStart?.isSame(range[0], 'day') &&
    currentEnd?.isSame(range[1], 'day')
  ) {
    return;
  }
  selectRangeValue(range);
}

// —— 序列化派发 ——
function validate(type: 'blur' | 'change'): void {
  if (props.validateEvent) formItemContext?.validate(type);
}

function selectValue(day: Dayjs): void {
  const value = serializeDate(day, props.valueFormat);
  editText.value = null;
  emit('update:modelValue', value);
  emit('change', value);
  close();
  validate('change');
}

function selectRangeValue(range: [Dayjs, Dayjs]): void {
  const value: [DatePickerSingleValue, DatePickerSingleValue] = [
    serializeDate(range[0], props.valueFormat),
    serializeDate(range[1], props.valueFormat),
  ];
  startEditText.value = null;
  endEditText.value = null;
  emit('update:modelValue', value);
  emit('change', value);
  close();
  validate('change');
}

// —— 清空：对齐 element-plus，派发 null ——
function clear(): void {
  emit('update:modelValue', null);
  emit('change', null);
  emit('clear');
  validate('change');
}

// —— 键盘导航（date 类型，对齐 element-plus） ——
const focusDate = ref<Dayjs | null>(null);

watch(open, (value) => {
  if (value && !isRange.value) {
    focusDate.value = selectedDay.value ?? dayjs();
  } else {
    focusDate.value = null;
  }
});

function onKeydown(event: KeyboardEvent): void {
  if (isRange.value || inputReadonly.value) return;
  // 面板打开：方向键移动键盘焦点，Enter 选中焦点日期；
  // 面板未开：Enter 直接提交输入文本
  if (!open.value) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitSingleEdit();
    }
    return;
  }
  const stepMap: Record<string, number> = {
    ArrowRight: 1,
    ArrowLeft: -1,
    ArrowDown: 7,
    ArrowUp: -7,
  };
  const step = stepMap[event.key];
  if (step !== undefined) {
    event.preventDefault();
    if (!focusDate.value) focusDate.value = selectedDay.value ?? dayjs();
    focusDate.value = focusDate.value.add(step, 'day');
  } else if (event.key === 'Enter') {
    const day = focusDate.value;
    if (day && !isDisabled(day)) selectValue(day);
  }
}

// —— 触发器交互 ——
function onTriggerClick(): void {
  if (disabled.value) return;
  toggle();
}

function onInputFocus(): void {
  emit('focus');
}

function onInputBlur(): void {
  emit('blur');
  if (isRange.value) commitRangeEdit();
  else commitSingleEdit();
  validate('blur');
}

const defaultValueDay = computed(() => parseDate(props.defaultValue ?? null));

// —— 快捷项返回值的类型透传给面板 ——
defineExpose({
  /** 打开面板 */
  openPanel: toggle,
  /** 清空值 */
  clear,
  focusDate,
});
</script>

<template>
  <div
    ref="rootRef"
    class="aero-date-picker"
    :class="[
      `aero-date-picker--${size}`,
      {
        'is-disabled': disabled,
        'is-open': open,
        'is-range': isRange,
      },
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focusin="focused = true"
    @focusout="focused = false"
  >
    <!-- 单日期触发器 -->
    <div v-if="!isRange" class="aero-date-picker__trigger" @click="onTriggerClick">
      <AeroIcon class="aero-date-picker__prefix-icon" :name="prefixIcon" :size="14" />
      <input
        class="aero-date-picker__inner"
        type="text"
        :value="editText ?? displayValue"
        :placeholder="placeholderText"
        :readonly="inputReadonly"
        :disabled="disabled"
        @input="onSingleInput"
        @keydown="onKeydown"
        @focus="onInputFocus"
        @blur="onInputBlur"
      />
      <AeroIcon
        v-if="showClear"
        class="aero-date-picker__clear"
        :name="clearIcon"
        :size="12"
        @mousedown.prevent
        @click.stop="clear"
      />
    </div>

    <!-- 范围触发器：双输入 + 分隔符 -->
    <div v-else class="aero-date-picker__trigger aero-date-picker__trigger--range" @click="onTriggerClick">
      <AeroIcon class="aero-date-picker__prefix-icon" :name="prefixIcon" :size="14" />
      <input
        class="aero-date-picker__inner"
        type="text"
        :value="startEditText ?? startDisplay"
        :placeholder="startPlaceholderText"
        :readonly="inputReadonly"
        :disabled="disabled"
        @input="onStartInput"
        @keydown="onKeydown"
        @focus="onInputFocus"
        @blur="onInputBlur"
      />
      <span class="aero-date-picker__separator">{{ rangeSeparator }}</span>
      <input
        class="aero-date-picker__inner"
        type="text"
        :value="endEditText ?? endDisplay"
        :placeholder="endPlaceholderText"
        :readonly="inputReadonly"
        :disabled="disabled"
        @input="onEndInput"
        @keydown="onKeydown"
        @focus="onInputFocus"
        @blur="onInputBlur"
      />
      <AeroIcon
        v-if="showClear"
        class="aero-date-picker__clear"
        :name="clearIcon"
        :size="12"
        @mousedown.prevent
        @click.stop="clear"
      />
    </div>

    <!-- 面板：teleported 为 true 时挂到 body（fixed 定位），否则就地渲染（absolute） -->
    <Teleport v-if="teleported" to="body">
      <Transition name="aero-date-picker">
        <div
          v-if="open"
          ref="panelRef"
          class="aero-date-picker__panel"
          :class="popperClass"
          :style="panelStyle"
        >
          <DatePanel
            v-if="!isRange"
            :model-value="selectedDay"
            :visible="open"
            :default-value="defaultValueDay"
            :disabled-date="disabledDate"
            :cell-class-name="cellClassName"
            :first-day-of-week="firstDayOfWeek"
            :shortcuts="shortcuts"
            :focused-date="focusDate"
            @select="selectValue"
            @panel-change="(...args) => emit('panel-change', ...args)"
          />
          <DateRangePanel
            v-else
            :model-value="rangeValue"
            :visible="open"
            :default-value="defaultValueDay"
            :disabled-date="disabledDate"
            :cell-class-name="cellClassName"
            :first-day-of-week="firstDayOfWeek"
            :shortcuts="shortcuts"
            :unlink-panels="unlinkPanels"
            @select="selectRangeValue"
            @calendar-change="(...args) => emit('calendar-change', ...args)"
          />
        </div>
      </Transition>
    </Teleport>
    <Transition v-else name="aero-date-picker">
      <div
        v-if="open"
        ref="panelRef"
        class="aero-date-picker__panel aero-date-picker__panel--inline"
        :class="popperClass"
        :style="panelStyle"
      >
        <DatePanel
          v-if="!isRange"
          :model-value="selectedDay"
          :visible="open"
          :default-value="defaultValueDay"
          :disabled-date="disabledDate"
          :cell-class-name="cellClassName"
          :first-day-of-week="firstDayOfWeek"
          :shortcuts="shortcuts"
          :focused-date="focusDate"
          @select="selectValue"
          @panel-change="(...args) => emit('panel-change', ...args)"
        />
        <DateRangePanel
          v-else
          :model-value="rangeValue"
          :visible="open"
          :default-value="defaultValueDay"
          :disabled-date="disabledDate"
          :cell-class-name="cellClassName"
          :first-day-of-week="firstDayOfWeek"
          :shortcuts="shortcuts"
          :unlink-panels="unlinkPanels"
          @select="selectRangeValue"
          @calendar-change="(...args) => emit('calendar-change', ...args)"
        />
      </div>
    </Transition>
  </div>
</template>
