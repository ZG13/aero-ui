<script setup lang="ts">
import { computed } from 'vue';
import AeroIcon from '../../icon';
import type { ButtonProps, ButtonEmits } from '../types';

defineOptions({ name: 'AeroButton' });

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'info',
  variant: 'solid',
  size: 'default',
  shape: 'default',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  nativeType: 'button',
});

const emit = defineEmits<ButtonEmits>();

const disabled = computed(() => props.disabled || props.loading);

function handleClick(event: MouseEvent) {
  if (disabled.value) return;
  emit('click', event);
}
</script>

<template>
  <button
    class="aero-button"
    :class="[
      `aero-button--${type}`,
      `aero-button--${variant}`,
      `aero-button--size-${size}`,
      `aero-button--${shape}`,
      { 'is-disabled': disabled, 'is-loading': loading, 'is-icon-only': !loading && !$slots.default && icon },
    ]"
    :type="nativeType"
    :disabled="disabled"
    @click="handleClick"
  >
    <!-- loading 态：文字保留，仅在文字左侧插入旋转 spinner（element-plus 风格） -->
    <span v-if="loading" class="aero-button__loading-icon" aria-hidden="true" />
    <AeroIcon
      v-if="!loading && icon && iconPosition === 'left'"
      class="aero-button__icon"
      :name="icon"
    />
    <span v-if="$slots.default" class="aero-button__content"><slot /></span>
    <AeroIcon
      v-if="!loading && icon && iconPosition === 'right'"
      class="aero-button__icon"
      :name="icon"
    />
  </button>
</template>
