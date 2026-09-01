<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { useFormSize, useFormDisabled } from '../../form/src/use-form';
import { formItemContextKey } from '../../form/src/constants';
import { usePopper } from '../../../hooks';
import { parseDate, formatDate } from './date';
import DateTable from './DateTable.vue';
import type {
  DatePickerProps,
  DatePickerEmits,
  DatePickerValue,
  DatePickerRangeValue,
} from '../types';

defineOptions({ name: 'AeroDatePicker' });

// disabled 显式默认 undefined：绕过 Vue 布尔 prop 强转，交由 useFormDisabled 解析
const props = withDefaults(defineProps<DatePickerProps>(), {
  type: 'date',
  format: 'YYYY-MM-DD',
  disabled: undefined,
  clearable: false,
  editable: true,
});

const emit = defineEmits<DatePickerEmits>();

// —— 表单上下文集成 ——
const formItemContext = inject(formItemContextKey, undefined);
const inheritedSize = useFormSize(props.size);
const inheritedDisabled = useFormDisabled(props.disabled);

const size = computed(() => inheritedSize.value ?? 'main');
const disabled = computed(() => inheritedDisabled.value);

const isRange = computed(() => props.type === 'daterange');

// —— 触发器与面板 ref ——
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

// —— 弹层定位 ——
const { open, panelStyle, close, toggle } = usePopper({
  trigger: rootRef,
  panel: panelRef,
});

watch(open, (value) => emit('visible-change', value));

// —— 日期状态 ——
function parseModel(): Dayjs | null {
  if (isRange.value) return null;
  return parseDate(props.modelValue as DatePickerValue);
}

const selectedDay = computed(() => parseModel());

// 范围态：进行中状态 [start, end]
const rangeState = ref<[Dayjs | null, Dayjs | null]>([null, null]);

function parseRange(): [Dayjs | null, Dayjs | null] {
  const v = props.modelValue as DatePickerRangeValue | undefined;
  if (!v) return [null, null];
  const start = parseDate(v[0]);
  const end = parseDate(v[1]);
  return [start, end];
}

// 同步受控范围值
watch(
  () => props.modelValue,
  () => {
    if (isRange.value) {
      rangeState.value = parseRange();
    }
  },
  { immediate: true },
);

// —— 回显 ——
const displayValue = computed(() => {
  if (isRange.value) {
    const [start, end] = rangeState.value;
    const startText = formatDate(start, props.format);
    const endText = formatDate(end, props.format);
    if (startText && endText) return `${startText} - ${endText}`;
    if (startText) return `${startText} - `;
    return '';
  }
  return formatDate(selectedDay.value, props.format);
});

const hasValue = computed(() =>
  isRange.value ? rangeState.value.some((d) => d !== null) : selectedDay.value !== null,
);

// —— 清空 ——
const showClear = computed(() => props.clearable && !disabled.value && hasValue.value);

function clear(): void {
  if (isRange.value) {
    rangeState.value = [null, null];
    emit('update:modelValue', undefined);
    emit('change', undefined);
  } else {
    emit('update:modelValue', undefined);
    emit('change', undefined);
  }
  emit('clear');
}

// —— 序列化派发 ——
function serialize(day: Dayjs): DatePickerValue {
  return props.valueFormat ? day.format(props.valueFormat) : day.toDate();
}

function serializeRange(range: [Dayjs, Dayjs]): DatePickerRangeValue {
  return [serialize(range[0]), serialize(range[1])];
}

// —— 选中逻辑 ——
function onSelect(day: Dayjs): void {
  if (isRange.value) {
    const [start, end] = rangeState.value;
    if (!start || (start && end)) {
      // 未选起始，或已选完整范围 → 重新从起始开始
      rangeState.value = [day, null];
    } else if (day.isBefore(start, 'day')) {
      // 结束早于起始 → 重设起始
      rangeState.value = [day, null];
    } else {
      rangeState.value = [start, day];
      emit('update:modelValue', serializeRange([start, day]));
      emit('change', serializeRange([start, day]));
      close();
      formItemContext?.validate('change');
    }
    return;
  }

  emit('update:modelValue', serialize(day));
  emit('change', serialize(day));
  close();
  formItemContext?.validate('change');
}

// —— 触发器交互 ——
function onTriggerClick(): void {
  if (disabled.value) return;
  toggle();
}

function onBlur(): void {
  formItemContext?.validate('blur');
}
</script>

<template>
  <div
    ref="rootRef"
    class="aero-date-picker"
    :class="[`aero-date-picker--${size}`, { 'is-disabled': disabled, 'is-open': open }]"
  >
    <div class="aero-date-picker__trigger" @click="onTriggerClick">
      <input
        class="aero-date-picker__inner"
        type="text"
        :value="displayValue"
        :placeholder="isRange ? (startPlaceholder ?? '') : placeholder"
        :readonly="!editable"
        :disabled="disabled"
        @blur="onBlur"
      />
      <span v-if="showClear" class="aero-date-picker__clear" @click.stop="clear"> × </span>
      <span class="aero-date-picker__arrow" aria-hidden="true"></span>
    </div>

    <Teleport to="body">
      <Transition name="aero-date-picker">
        <div v-if="open" ref="panelRef" class="aero-date-picker__panel" :style="panelStyle">
          <DateTable
            :model-value="isRange ? rangeState[1] : selectedDay"
            :range="isRange ? rangeState : undefined"
            :is-range="isRange"
            :disabled-date="disabledDate"
            :current-month="
              isRange ? (rangeState[0] ?? selectedDay ?? dayjs()) : (selectedDay ?? dayjs())
            "
            @select="onSelect"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
