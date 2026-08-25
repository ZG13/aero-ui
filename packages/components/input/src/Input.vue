<script setup lang="ts">
import { computed } from 'vue';
import AeroIcon from '../../icon';
import { useLocale } from '../../../hooks';
import type { InputProps, InputEmits } from '../types';

defineOptions({ name: 'AeroInput' });

const props = withDefaults(defineProps<InputProps>(), {
  size: 'main',
  disabled: false,
  clearable: false,
});

const emit = defineEmits<InputEmits>();

const { t } = useLocale();

const placeholder = computed(() => props.placeholder ?? t('components.input.placeholder'));

const showClear = computed(() => props.clearable && !props.disabled && !!props.modelValue);

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  emit('input', value);
}

function handleFocus(event: FocusEvent) {
  emit('focus', event);
}

function handleBlur(event: FocusEvent) {
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
  <div class="aero-input" :class="[`aero-input--${size}`, { 'is-disabled': disabled }]">
    <input
      class="aero-input__inner"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <AeroIcon
      v-if="showClear"
      class="aero-input__clear"
      name="close"
      color="currentColor"
      @click="handleClear"
    />
  </div>
</template>
