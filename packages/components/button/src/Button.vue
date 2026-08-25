<script setup lang="ts">
import { computed } from 'vue';
import AeroIcon from '../../icon';
import { useLocale } from '../../../hooks';
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

const { t } = useLocale();

const disabled = computed(() => props.disabled || props.loading);

const iconName = computed(() => (props.loading ? 'loading' : props.icon));

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
      { 'is-disabled': disabled, 'is-loading': loading, 'is-icon-only': !loading && !$slots.default && iconName },
    ]"
    :type="nativeType"
    :disabled="disabled"
    @click="handleClick"
  >
    <AeroIcon
      v-if="iconName && iconPosition === 'left'"
      class="aero-button__icon"
      :name="iconName"
    />
    <span v-if="loading" class="aero-button__loading">{{ t('components.button.loading') }}</span>
    <span v-else class="aero-button__content"><slot /></span>
    <AeroIcon
      v-if="iconName && iconPosition === 'right'"
      class="aero-button__icon"
      :name="iconName"
    />
  </button>
</template>
