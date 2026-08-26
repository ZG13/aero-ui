import type { FormItemRule, FormSize } from '../form/types';

/**
 * 表单项校验状态：
 * - ''：无校验状态（默认）
 * - 'error'：校验失败
 * - 'validating'：校验进行中
 */
export type FormItemValidateState = '' | 'error' | 'validating';

/**
 * AeroFormItem 表单项 props
 */
export interface FormItemProps {
  /** 字段名，关联表单 model 中的字段与校验规则 */
  prop?: string;
  /** @default '' 标签文案 */
  label?: string;
  /** 标签宽度，覆盖表单级 label-width */
  labelWidth?: string | number;
  /** @default false 是否必填，在标签旁展示必填星号 */
  required?: boolean;
  /** 表单项级校验规则，追加或覆盖表单级 rules */
  rules?: FormItemRule | FormItemRule[];
  /** 手动错误信息，覆盖校验产生的错误消息 */
  error?: string;
  /** @default true 是否展示错误消息 */
  showMessage?: boolean;
  /** 表单项级尺寸，缺省时继承表单级 size */
  size?: FormSize;
  /** @default false 表单项级禁用，缺省时继承表单级 disabled */
  disabled?: boolean;
  /** 手动控制的校验状态 */
  validateStatus?: FormItemValidateState;
}

/**
 * AeroFormItem 表单项事件
 */
export interface FormItemEmits {
  /** 字段校验完成后触发 */
  (e: 'validate', prop: string, isValid: boolean, message: string): void;
}
