<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { ButtonProps } from '../types';

/**
 * EpButton 通用按钮
 * @description 用于触发操作，支持多类型、多尺寸、多样式（实心/描边/无底）、图标、加载与禁用状态。
 */
const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'middle',
  variant: 'solid',
  round: false,
  disabled: false,
  loading: false,
  nativeType: 'button',
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const slots = useSlots();

/** 是否为图标独占模式：无默认文本内容且存在图标 */
const isIconOnly = computed(
  () => !slots.default && (!!props.icon || !!props.suffixIcon) && !slots.icon,
);

const buttonClass = computed(() => [
  'ep-button',
  `ep-button--${props.type}`,
  `ep-button--${props.variant}`,
  `ep-button--${props.size}`,
  {
    'is-round': props.round,
    'is-disabled': props.disabled,
    'is-loading': props.loading,
    'is-icon-only': isIconOnly.value,
  },
]);

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return;
  emit('click', event);
};
</script>

<template>
  <button
    :class="buttonClass"
    :type="nativeType"
    :disabled="disabled"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="ep-button__loading"
      aria-hidden="true"
    />
    <span
      v-else-if="$slots.icon || icon"
      class="ep-button__icon ep-button__icon--left"
    >
      <slot name="icon">
        <i :class="icon" />
      </slot>
    </span>

    <span
      v-if="$slots.default"
      class="ep-button__text"
    >
      <slot />
    </span>

    <span
      v-if="suffixIcon"
      class="ep-button__icon ep-button__icon--right"
    >
      <i :class="suffixIcon" />
    </span>
  </button>
</template>
