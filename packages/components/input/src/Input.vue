<script setup lang="ts">
import { computed, ref } from 'vue';
import AeroIcon from '../../icon';
import { useLocale } from '../../../hooks';
import type { InputProps, InputEmits } from '../types';

defineOptions({ name: 'AeroInput' });

const props = withDefaults(defineProps<InputProps>(), {
  size: 'main',
  disabled: false,
  clearable: false,
  floating: true,
});

const emit = defineEmits<InputEmits>();

const { t } = useLocale();

const placeholder = computed(() => props.placeholder ?? t('components.input.placeholder'));

const focused = ref(false);

// 占位文案是否有值（number 0 也视为有值）
const hasValue = computed(
  () => props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined,
);

// Material outlined 风格：获得焦点或有值时，占位 label 上浮吸附到上边框。
const isFloating = computed(() => focused.value || hasValue.value);

const showClear = computed(() => props.clearable && !props.disabled && !!props.modelValue);

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
  emit('change', (event.target as HTMLInputElement).value);
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
      color="currentColor"
      @click="handleClear"
    />
  </div>
</template>
