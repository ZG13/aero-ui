export type InputNumberSize = 'large' | 'main' | 'small';

export interface InputNumberProps {
  /** 绑定值（受控数值） */
  modelValue?: number;
  /** 步长 @default 1 */
  step?: number;
  /** 最小值 @default -Infinity */
  min?: number;
  /** 最大值 @default Infinity */
  max?: number;
  /** 小数精度（四舍五入位数） @default undefined */
  precision?: number;
  /** 是否严格步进（输入值对齐到 step 倍数） @default false */
  stepStrictly?: boolean;
  /** 是否显示步进按钮 @default true */
  controls?: boolean;
  /** 是否禁用（缺省继承表单级 disabled） */
  disabled?: boolean;
  /** 尺寸（缺省继承表单级 size） @default 'main' */
  size?: InputNumberSize;
  /** 是否只读（禁键盘输入但允许步进） @default false */
  readonly?: boolean;
  /** 占位文案 */
  placeholder?: string;
  /** 原生 name 属性，透传到内部输入元素 */
  name?: string;
}

export interface InputNumberEmits {
  (e: 'update:modelValue', value: number | undefined): void;
  (e: 'change', value: number | undefined): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}
