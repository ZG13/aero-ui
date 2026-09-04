<script setup lang="ts">
import { computed, inject } from 'vue';
import { useFormSize, useFormDisabled } from '../../form/src/use-form';
import { formItemContextKey } from '../../form/src/constants';
import { radioGroupContextKey } from './constants';
import type { RadioEmits, RadioButtonProps, RadioSize, RadioValue } from '../types';

defineOptions({ name: 'AeroRadioButton' });

// disabled 显式默认 undefined：绕过 Vue 布尔 prop 的「未声明 → false」强转，
// 使「未声明」与「声明 false」可区分，交由 useFormDisabled 按
// 「自身 → formItem → form → 默认」解析（对齐 AeroRadio / AeroInput）。
const props = withDefaults(defineProps<RadioButtonProps>(), {
  value: undefined,
  label: undefined,
  disabled: undefined,
  name: undefined,
  modelValue: undefined,
});

const emit = defineEmits<RadioEmits>();

// —— 上下文注入（均安全回退，脱离 group / 表单不抛错） ——
// 分组上下文：位于 RadioGroup 内时，选中态与 disabled/size/name 以组下发状态优先
const groupContext = inject(radioGroupContextKey, undefined);
// 表单项上下文：独立使用时值变化触发 change 校验
const formItemContext = inject(formItemContextKey, undefined);

// 独立场景的表单级继承（组内由容器解析后经 context 下发，此处仅独立场景消费）
// 注意：RadioButtonProps 无 size 字段，独立场景仅经表单继承解析，缺省回退 main
const inheritedSize = useFormSize(undefined);
const inheritedDisabled = useFormDisabled(props.disabled);

// —— 值与状态解析（独立实现，与 Radio 相同的判定规则，不共享逻辑文件） ——
// 选项值：value 缺省回退 label（兼容别名）；二者皆缺省按 undefined 参与比较
const optionValue = computed<RadioValue | undefined>(() => props.value ?? props.label);

// 选中判定：组内以组绑定值优先，独立时用自身绑定值
const checked = computed(
  () => (groupContext?.modelValue ?? props.modelValue) === optionValue.value,
);

// 尺寸：组内取组下发尺寸（已解析），独立时经表单继承回退 main
const size = computed<RadioSize>(() => {
  if (groupContext) {
    return groupContext.size;
  }
  return (inheritedSize.value as RadioSize | undefined) ?? 'main';
});

// 禁用：组内为「组禁用 || 自身禁用」（3.4），独立时经表单继承解析
const disabled = computed(() => {
  if (groupContext) {
    return groupContext.disabled || props.disabled === true;
  }
  return inheritedDisabled.value;
});

// 原生 name：组内取组统一下发（同组键盘导航），独立时用自身 name
const name = computed(() => groupContext?.name ?? props.name);

// —— 激活态颜色（3.2 / 3.3） ——
// 选中且组内下发了 fill / textColor 时以行内样式覆盖激活态；
// 未下发时保持 undefined，由样式层的 is-checked 默认主题色兜底（3.3）
const activeStyle = computed(() => {
  if (!checked.value || !groupContext) return undefined;
  return {
    backgroundColor: groupContext.fill,
    color: groupContext.textColor,
  };
});

// —— 点击派发 ——
// 禁用不响应（3.4）；点击已选中项保持不变、不触发 change；
// 点击未选中项：组内上报容器统一派发，独立时自派发并触发 change 校验（3.5）
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
    class="aero-radio-button"
    :class="[
      size !== 'main' ? `aero-radio-button--${size}` : '',
      {
        'is-checked': checked,
        'is-disabled': disabled,
      },
    ]"
    :style="activeStyle"
  >
    <!--
      透明原生 radio 覆盖于视觉层之上：承载键盘（方向键/空格）与屏幕阅读器语义（5.1），
      checked 由绑定值驱动（受控），点击经 handleClick 统一派发。
    -->
    <input
      class="aero-radio-button__original"
      type="radio"
      :checked="checked"
      :disabled="disabled"
      :name="name"
      :aria-checked="checked"
      :tabindex="disabled ? -1 : 0"
      @click.prevent="handleClick"
    />
    <!-- 按钮文案插槽：外观与激活态由样式层的 is-checked 修饰符控制（3.1 / 3.2） -->
    <span class="aero-radio-button__text"><slot></slot></span>
  </label>
</template>
