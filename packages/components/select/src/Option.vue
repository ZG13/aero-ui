<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted } from 'vue';
import { selectContextKey } from './constants';
import type { SelectOption, SelectValue } from './constants';
import type { OptionProps } from '../types';

defineOptions({ name: 'AeroOption' });

const props = withDefaults(defineProps<OptionProps>(), {
  label: undefined,
  value: undefined,
  disabled: false,
});

const context = inject(selectContextKey, undefined);

// 选项快照：value 缺省回退 label；label 缺省回退 value。二者皆缺省时按空值处理。
const option = computed<SelectOption>(() => {
  const value = (props.value ?? props.label) as SelectValue;
  const label = (props.label ?? props.value) as SelectValue;
  return { label, value, disabled: props.disabled };
});

onMounted(() => {
  context?.addOption(option.value);
});

onBeforeUnmount(() => {
  context?.removeOption(option.value);
});
</script>

<template>
  <!-- AeroOption 为声明式选项：仅注册数据到 selectContext，由 AeroSelect 统一渲染选项行 -->
</template>
