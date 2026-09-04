/** 单选值类型：radio 选项与绑定值支持的原始类型 */
export type RadioValue = string | number | boolean;

/** 单选尺寸 */
export type RadioSize = 'large' | 'main' | 'small';

/** Radio 与 RadioButton 共享的选项基础契约 */
export interface BaseRadioOptionProps {
  /** 选项值（选中时写入绑定值的值；缺省回退 label） */
  value?: RadioValue;
  /** 选项值（兼容别名，语义同 value） @deprecated */
  label?: RadioValue;
  /** @default false 是否禁用该选项 */
  disabled?: boolean;
  /** 原生 radio 的 name 属性（同组使用相同 name 以支持键盘导航） */
  name?: string;
}

/** 圆点单选项（AeroRadio）的 props 契约 */
export interface RadioProps extends BaseRadioOptionProps {
  /** 绑定值（独立使用时生效；位于 RadioGroup 内时以组绑定值优先） */
  modelValue?: RadioValue;
  /** @default false 是否显示外边框 */
  border?: boolean;
  /** 尺寸（border 或按钮样式下生效；缺省继承表单级 size） */
  size?: RadioSize;
}

/** 按钮单选项（AeroRadioButton）的 props 契约 */
export interface RadioButtonProps extends BaseRadioOptionProps {
  /** 绑定值（脱离 RadioGroup 独立使用时生效） */
  modelValue?: RadioValue;
}

/** 分组容器（AeroRadioGroup）的 props 契约 */
export interface RadioGroupProps {
  /** 组绑定值：组内至多一个选项与之匹配呈选中态 */
  modelValue?: RadioValue;
  /** 组内所有子选项的尺寸（子项自身 size 优先；缺省继承表单级 size） */
  size?: RadioSize;
  /** @default false 是否禁用组内所有子选项 */
  disabled?: boolean;
  /** 按钮样式子项选中态的背景色 */
  fill?: string;
  /** 按钮样式子项选中态的文字色 */
  textColor?: string;
  /** 透传给组内所有子选项原生 radio 的 name 属性（同组键盘导航） */
  name?: string;
  /** @default true 值变化时是否触发表单校验 */
  validateEvent?: boolean;
  /** 原生 aria-label（无障碍标签） */
  label?: string;
}

/** 圆点/按钮单选项的事件契约 */
export interface RadioEmits {
  /** 独立使用时绑定值更新 */
  (e: 'update:modelValue', value: RadioValue): void;
  /** 选中值变化，携带新值 */
  (e: 'change', value: RadioValue): void;
}

/** 分组容器的事件契约 */
export interface RadioGroupEmits {
  /** 组绑定值更新 */
  (e: 'update:modelValue', value: RadioValue): void;
  /** 组选中值变化，携带新值 */
  (e: 'change', value: RadioValue): void;
}
