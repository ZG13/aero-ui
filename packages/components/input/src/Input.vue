<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import AeroIcon from '../../icon';
import { useLocale } from '../../../hooks';
import { useFormSize, useFormDisabled } from '../../form/src/use-form';
import { formItemContextKey } from '../../form/src/constants';
import type { InputProps, InputEmits } from '../types';

defineOptions({ name: 'AeroInput' });

// disabled 显式默认 undefined：绕过 Vue 布尔 prop 的「未声明 → false」强转，
// 使「未声明」与「声明 false」可区分，交由 useFormDisabled 按
// 「自身 → formItem → form → 默认」解析；size 为字符串枚举，未声明时本即 undefined。
const props = withDefaults(defineProps<InputProps>(), {
  disabled: undefined,
  clearable: false,
  floating: true,
});

const emit = defineEmits<InputEmits>();

const { t } = useLocale();

// 表单项上下文：存在时在 blur/change 触发字段即时校验，缺失时安全跳过。
const formItemContext = inject(formItemContextKey, undefined);

const inheritedSize = useFormSize(props.size);
const inheritedDisabled = useFormDisabled(props.disabled);

const size = computed(() => inheritedSize.value ?? 'main');
const disabled = computed(() => inheritedDisabled.value);

const placeholder = computed(() => props.placeholder ?? t('components.input.placeholder'));

const focused = ref(false);

// 占位文案是否有值（number 0 也视为有值）
const hasValue = computed(
  () => props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined,
);

// Material outlined 风格：获得焦点或有值时，占位 label 上浮吸附到上边框。
const isFloating = computed(() => focused.value || hasValue.value);

const showClear = computed(() => props.clearable && !disabled.value && !!props.modelValue);

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  emit('input', value);
}

function handleFocus(event: FocusEvent) {
  focused.value = true;
  emit('focus', event);
}

function handleBlur(event: FocusEvent) {
  focused.value = false;
  emit('blur', event);
  formItemContext?.validate('blur');
  emit('change', (event.target as HTMLInputElement).value);
  formItemContext?.validate('change');
}

function handleClear() {
  emit('update:modelValue', '');
  emit('input', '');
  emit('clear');
}
</script>

<template>
  <div class="aero-input" :class="[`aero-input--${size}`, { 'is-disabled': disabled, 'is-float': isFloating, 'aero-input--static': !floating }]">
    <input
      class="aero-input__inner"
      :value="modelValue"
      :placeholder="floating ? '' : placeholder"
      :disabled="disabled"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <span v-if="floating" class="aero-input__label" aria-hidden="true">{{ placeholder }}</span>
    <AeroIcon
      v-if="showClear"
      class="aero-input__clear"
      name="close"
      :size="10"
      color="currentColor"
      @click="handleClear"
    />
  </div>
</template>
