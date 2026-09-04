<script setup lang="ts">
import { computed, inject } from 'vue';
import { useFormSize, useFormDisabled } from '../../form/src/use-form';
import { formItemContextKey } from '../../form/src/constants';
import { radioGroupContextKey } from './constants';
import type { RadioEmits, RadioProps, RadioSize, RadioValue } from '../types';

defineOptions({ name: 'AeroRadio' });

// disabled 显式默认 undefined：绕过 Vue 布尔 prop 的「未声明 → false」强转，
// 使「未声明」与「声明 false」可区分，交由 useFormDisabled 按
// 「自身 → formItem → form → 默认」解析（对齐 AeroInput / AeroInputNumber）。
const props = withDefaults(defineProps<RadioProps>(), {
  value: undefined,
  label: undefined,
  disabled: undefined,
  name: undefined,
  modelValue: undefined,
  border: false,
  size: undefined,
});

const emit = defineEmits<RadioEmits>();

// —— 上下文注入（均安全回退，脱离 group / 表单不抛错） ——
// 分组上下文：位于 RadioGroup 内时，选中态与 disabled/size/name 以组下发状态优先
const groupContext = inject(radioGroupContextKey, undefined);
// 表单项上下文：独立使用时值变化触发 change 校验
const formItemContext = inject(formItemContextKey, undefined);

// 独立场景的表单级继承（组内由容器解析后经 context 下发，此处仅独立场景消费）
const inheritedSize = useFormSize(props.size);
const inheritedDisabled = useFormDisabled(props.disabled);

// —— 值与状态解析 ——
// 选项值：value 缺省回退 label（兼容别名，1.9）；二者皆缺省按 undefined 参与比较
const optionValue = computed<RadioValue | undefined>(() => props.value ?? props.label);

// 选中判定：组内以组绑定值优先，独立时用自身绑定值
const checked = computed(
  () => (groupContext?.modelValue ?? props.modelValue) === optionValue.value,
);

// 尺寸：组内子项自身 size 优先（2.4），否则取组下发尺寸；独立时经表单继承回退 main（1.7）
const size = computed<RadioSize>(() => {
  if (groupContext) {
    return props.size ?? groupContext.size;
  }
  return inheritedSize.value ?? 'main';
});

// 禁用：组内为「组禁用 || 自身禁用」（2.5），独立时经表单继承解析（1.5）
const disabled = computed(() => {
  if (groupContext) {
    return groupContext.disabled || props.disabled === true;
  }
  return inheritedDisabled.value;
});

// 原生 name：组内取组统一下发（2.6，同组键盘导航），独立时用自身 name（1.8）
const name = computed(() => groupContext?.name ?? props.name);

// —— 点击派发 ——
// 禁用不响应（1.5）；点击已选中项保持不变、不触发 change（1.4）；
// 点击未选中项：组内上报容器统一派发，独立时自派发并触发 change 校验（1.3 / 4.2）
function handleClick(): void {
  if (disabled.value || checked.value) return;

  if (groupContext) {
    groupContext.changeEvent(optionValue.value as RadioValue);
    return;
  }

  emit('update:modelValue', optionValue.value as RadioValue);
  emit('change', optionValue.value as RadioValue);
  formItemContext?.validate('change');
}
</script>

<template>
  <label
    class="aero-radio"
    :class="[
      size !== 'main' ? `aero-radio--${size}` : '',
      {
        'is-checked': checked,
        'is-disabled': disabled,
        'is-border': border,
      },
    ]"
  >
    <!--
      透明原生 radio 覆盖于视觉层之上：承载键盘（方向键/空格）与屏幕阅读器语义（5.1–5.3），
      checked 由绑定值驱动（受控），点击经 handleClick 统一派发。
    -->
    <input
      class="aero-radio__original"
      type="radio"
      :checked="checked"
      :disabled="disabled"
      :name="name"
      :aria-checked="checked"
      :tabindex="disabled ? -1 : 0"
      @click.prevent="handleClick"
    />
    <!-- 视觉圆点：选中态高亮由样式层的 is-checked 修饰符控制（1.1 / 1.2） -->
    <span class="aero-radio__dot" aria-hidden="true"></span>
    <!-- 选项文案插槽 -->
    <span class="aero-radio__text"><slot></slot></span>
  </label>
</template>
