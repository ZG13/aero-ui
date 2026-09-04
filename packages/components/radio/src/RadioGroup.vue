<script setup lang="ts">
import { inject, provide, reactive, watch } from 'vue';
import { useFormSize, useFormDisabled } from '../../form/src/use-form';
import { formItemContextKey } from '../../form/src/constants';
import { radioGroupContextKey } from './constants';
import type { RadioGroupEmits, RadioGroupProps, RadioValue } from '../types';

defineOptions({ name: 'AeroRadioGroup' });

// 各可选 prop 显式默认 undefined：绕过 Vue 布尔 prop 的「未声明 → false」强转，
// 使「未声明」与「声明 false」可区分，交由 useFormDisabled / useFormSize 按
// 「自身 → formItem → form → 默认」解析（对齐 AeroRadio / AeroInputNumber）。
const props = withDefaults(defineProps<RadioGroupProps>(), {
  modelValue: undefined,
  size: undefined,
  disabled: undefined,
  fill: undefined,
  textColor: undefined,
  name: undefined,
  validateEvent: true,
  label: undefined,
});

const emit = defineEmits<RadioGroupEmits>();

// —— 表单上下文集成（均安全回退，脱离表单不抛错，4.3） ——
const formItemContext = inject(formItemContextKey, undefined);
const inheritedSize = useFormSize(props.size);
const inheritedDisabled = useFormDisabled(props.disabled);

// 组内下发尺寸：表单级继承回退后缺省 main（2.4）
const size = inheritedSize.value ?? 'main';
// 组内下发禁用态（2.5，含表单级继承）
const disabled = inheritedDisabled.value;

// —— change 派发 ——
// 子项上报新值的统一入口（System Flows）：
// 始终派发 update:modelValue；值发生变化时才派发 change 并触发表单校验
// （validateEvent 为 false 时不触发校验，2.8 / 4.2）
function changeEvent(value: RadioValue): void {
  const changed = props.modelValue !== value;

  emit('update:modelValue', value);

  if (changed) {
    emit('change', value);
    if (props.validateEvent !== false) {
      // fire-and-forget：不阻塞子项点击流程
      formItemContext?.validate('change');
    }
  }
}

// —— 分组上下文下发 ——
// 用 reactive 对象承载下发状态，子项读取 groupContext.modelValue 等纯值；
// 通过 watch 将 props / 表单级继承的变化同步进 reactive 字段，
// 保证绑定值、尺寸、禁用、name、fill/textColor 变化时子项重新渲染（契约保持响应式）。
const groupContext = reactive({
  modelValue: props.modelValue,
  size,
  disabled,
  name: props.name,
  fill: props.fill,
  textColor: props.textColor,
  changeEvent,
});

watch(
  () =>
    [
      props.modelValue,
      props.size,
      props.disabled,
      props.name,
      props.fill,
      props.textColor,
      inheritedSize.value,
      inheritedDisabled.value,
    ] as const,
  () => {
    groupContext.modelValue = props.modelValue;
    groupContext.size = inheritedSize.value ?? 'main';
    groupContext.disabled = inheritedDisabled.value;
    groupContext.name = props.name;
    groupContext.fill = props.fill;
    groupContext.textColor = props.textColor;
  },
  { immediate: true },
);

provide(radioGroupContextKey, groupContext);
</script>

<template>
  <!-- 分组容器：不渲染子项，仅承载插槽并下发分组上下文（2.1–2.7） -->
  <div class="aero-radio-group" role="radiogroup" :aria-label="props.label">
    <slot></slot>
  </div>
</template>
