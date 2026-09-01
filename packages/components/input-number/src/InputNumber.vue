<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { useFormSize, useFormDisabled } from '../../form/src/use-form';
import { formItemContextKey } from '../../form/src/constants';
import { alignStep, clamp, decrease, increase, toPrecision } from './number';
import type { InputNumberProps, InputNumberEmits } from '../types';

defineOptions({ name: 'AeroInputNumber' });

// disabled 显式默认 undefined：绕过 Vue 布尔 prop 的「未声明 → false」强转，
// 交由 useFormDisabled 按「自身 → 表单项 → 表单 → 默认」解析（对齐 AeroInput）。
const props = withDefaults(defineProps<InputNumberProps>(), {
  step: 1,
  min: -Infinity,
  max: Infinity,
  stepStrictly: false,
  controls: true,
  disabled: undefined,
  readonly: false,
});

const emit = defineEmits<InputNumberEmits>();

// —— 表单上下文集成 ——
const formItemContext = inject(formItemContextKey, undefined);
const inheritedSize = useFormSize(props.size);
const inheritedDisabled = useFormDisabled(props.disabled);

const size = computed(() => inheritedSize.value ?? 'main');
const disabled = computed(() => inheritedDisabled.value);

// —— 受控值 + 输入态分离 ——
// displayValue 承载输入过程中的临时文本，失焦/Enter 才解析提交，
// 避免 precision/step 强制格式化打断输入（如输入 `-`、`1.`）。
const displayValue = ref<string>('');

// 同步受控值到显示文本（受控值变化时）
watch(
  () => props.modelValue,
  (value) => {
    displayValue.value = value === undefined || value === null ? '' : String(value);
  },
  { immediate: true },
);

function hasValue(): boolean {
  return props.modelValue !== undefined && props.modelValue !== null;
}

// —— 步进 ——
function onIncrease(): void {
  if (disabled.value) return;
  emitNumber(increase(props.modelValue, props.step, props.min, props.max, props.precision));
}

function onDecrease(): void {
  if (disabled.value) return;
  emitNumber(decrease(props.modelValue, props.step, props.min, props.max, props.precision));
}

// 边界：到达 min/max 时对应方向步进按钮禁用
const increaseDisabled = computed(
  () => disabled.value || (hasValue() && props.modelValue! >= props.max),
);
const decreaseDisabled = computed(
  () => disabled.value || (hasValue() && props.modelValue! <= props.min),
);

// —— 提交（失焦/Enter 时解析 displayValue） ——
function parseInput(raw: string): number | undefined {
  const text = raw.trim();
  if (text === '') return undefined;
  const num = Number(text);
  if (Number.isNaN(num)) return undefined;
  return num;
}

function emitNumber(value: number | undefined): void {
  if (value === undefined) {
    emit('update:modelValue', undefined);
    emit('change', undefined);
    return;
  }
  const clamped = clamp(value, props.min, props.max);
  let next = toPrecision(clamped, props.precision);
  if (props.stepStrictly) next = alignStep(next, props.step);
  emit('update:modelValue', next);
  emit('change', next);
}

function commit(): void {
  const parsed = parseInput(displayValue.value);
  if (parsed === undefined) {
    // 非法/空输入：回退显示受控值，不派发
    displayValue.value = hasValue() ? String(props.modelValue) : '';
    return;
  }
  emitNumber(parsed);
  displayValue.value = hasValue() ? String(props.modelValue) : '';
  formItemContext?.validate('change');
}

function onInput(event: Event): void {
  // 仅允许录入数值字符（含负号、小数点），其余丢弃
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^\d.-]/g, '');
  displayValue.value = input.value;
}

function onBlur(event: FocusEvent): void {
  commit();
  emit('blur', event);
  formItemContext?.validate('blur');
}

function onFocus(event: FocusEvent): void {
  emit('focus', event);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault();
    commit();
  }
}
</script>

<template>
  <div
    class="aero-input-number"
    :class="[
      `aero-input-number--${size}`,
      {
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-controls': controls,
      },
    ]"
  >
    <input
      class="aero-input-number__inner"
      type="text"
      inputmode="decimal"
      :value="displayValue"
      :placeholder="placeholder"
      :name="name"
      :disabled="disabled"
      :readonly="readonly"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    />
    <span v-if="controls" class="aero-input-number__controls">
      <span
        class="aero-input-number__increase"
        :class="{ 'is-disabled': increaseDisabled }"
        aria-hidden="true"
        @click="onIncrease"
      ></span>
      <span
        class="aero-input-number__decrease"
        :class="{ 'is-disabled': decreaseDisabled }"
        aria-hidden="true"
        @click="onDecrease"
      ></span>
    </span>
  </div>
</template>
