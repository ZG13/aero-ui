import type { InjectionKey } from 'vue';

import type { RadioSize, RadioValue } from '../types';

/**
 * AeroRadioGroup 通过 `provide(radioGroupContextKey)` 下发给组内
 * AeroRadio / AeroRadioButton 的分组上下文。
 *
 * 容器负责聚合分组状态（绑定值、尺寸、禁用、原生 name、按钮激活态颜色），
 * 子项注入此上下文以判定选中态与读取下发配置；点击未选中项时通过
 * `changeEvent` 上报新值，由容器统一派发 update:modelValue / change
 * 并触发表单校验。父子经此 key 解耦，子项不直接依赖容器实例。
 */
export interface RadioGroupContext {
  /** 组绑定值：组内至多一个选项值与之匹配呈选中态 */
  modelValue: RadioValue | undefined;
  /** 组内子选项的尺寸（已经 useFormSize 解析，含表单级继承） */
  size: RadioSize;
  /** 是否禁用组内所有子选项（已经 useFormDisabled 解析，含表单级继承） */
  disabled: boolean;
  /** 透传给组内所有子选项原生 radio 的 name 属性（同组键盘导航） */
  name: string | undefined;
  /** 按钮样式子项选中态的背景色 */
  fill: string | undefined;
  /** 按钮样式子项选中态的文字色 */
  textColor: string | undefined;
  /** 子项上报新值：容器派发 update:modelValue / change 并触发表单校验 */
  changeEvent: (value: RadioValue) => void;
}

/** 分组上下文注入 key（Symbol，避免字符串 key 冲突） */
export const radioGroupContextKey: InjectionKey<RadioGroupContext> =
  Symbol('radioGroupContextKey');
