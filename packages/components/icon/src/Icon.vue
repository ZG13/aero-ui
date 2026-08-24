<script setup lang="ts">
import { computed } from 'vue';
import type { IconProps } from '../types';

const props = withDefaults(defineProps<IconProps>(), {
  size: '1em',
  color: 'currentColor',
});

const sizeValue = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size));

// 内置图标集（viewBox 0 0 24 24），未知 name 渲染为空内容
const icons: Record<string, string> = {
  search:
    'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  close:
    'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  loading:
    'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z',
};

const path = computed(() => icons[props.name] ?? '');
</script>

<template>
  <svg
    v-if="path"
    class="aero-icon"
    :width="sizeValue"
    :height="sizeValue"
    :style="{ color }"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path :d="path" />
  </svg>
</template>
