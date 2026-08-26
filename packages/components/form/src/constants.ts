import type { InjectionKey } from 'vue';
import type {
  FormRules,
  FormSize,
  FormValidateTrigger,
  ValidateFieldsError,
} from '../types';
import type { FormItemValidateState } from '../../form-item/types';

/**
 * AeroForm 通过 `provide` 下发的表单级响应式上下文。
 *
 * 供内部控件（Input 等）与 AeroFormItem 消费：读取布局/尺寸/禁用等配置，
 * 以及调用字段注册与校验等表单级方法。`size`/`disabled` 缺省时由消费方
 * （useFormSize/useFormDisabled）按优先级回退。
 */
export interface FormContext {
  /** 表单数据模型（响应式） */
  model: Record<string, unknown>;
  /** 校验规则集合 */
  rules: FormRules;
  /** 表单级尺寸 */
  size: FormSize | undefined;
  /** 是否禁用整表 */
  disabled: boolean;
  /** 标签宽度 */
  labelWidth: string | number | undefined;
  /** 标签位置 */
  labelPosition: 'left' | 'right' | 'top' | undefined;
  /** 是否行内布局 */
  inline: boolean;
  /** 是否展示校验消息 */
  showMessage: boolean;
  /** 是否展示校验状态图标 */
  statusIcon: boolean;
  /** 注册字段（AeroFormItem 挂载时调用） */
  addField: (field: FormItemContext) => void;
  /** 注销字段（AeroFormItem 卸载时调用） */
  removeField: (field: FormItemContext) => void;
  /** 校验全部字段；通过 resolve true，失败 reject ValidateFieldsError */
  validate: (
    callback?: (valid: boolean, invalidFields?: ValidateFieldsError) => void,
  ) => Promise<boolean>;
  /** 校验指定字段 */
  validateField: (
    props?: string | string[],
    callback?: (valid: boolean, invalidFields?: ValidateFieldsError) => void,
  ) => Promise<boolean>;
  /** 重置指定/全部字段至初始值并清除校验状态 */
  resetFields: (props?: string | string[]) => void;
  /** 清除指定/全部字段的校验状态与错误信息 */
  clearValidate: (props?: string | string[]) => void;
  /** 滚动到指定字段 */
  scrollToField: (prop: string) => void;
}

/**
 * AeroFormItem 通过 `provide` 下发的字段级响应式上下文。
 *
 * 供子控件（Input 等）消费：读取字段关联（prop）、触发字段即时校验，
 * 以及读取字段级 size/disabled 与校验状态。
 */
export interface FormItemContext {
  /** 字段名，关联表单 model 字段与校验规则 */
  prop: string;
  /** 触发字段即时校验（按 trigger 过滤规则） */
  validate: (trigger?: FormValidateTrigger) => Promise<void>;
  /** 重置字段 */
  resetField: () => void;
  /** 清除字段校验状态与错误信息 */
  clearValidate: () => void;
  /** 字段校验状态 */
  validateState: FormItemValidateState;
  /** 字段校验消息 */
  validateMessage: string;
  /** 字段级尺寸 */
  size: FormSize | undefined;
  /** 字段级禁用 */
  disabled: boolean;
}

/** 表单级上下文注入 key（Symbol，避免字符串 key 冲突） */
export const formContextKey: InjectionKey<FormContext> = Symbol('formContextKey');

/** 表单项级上下文注入 key（Symbol，避免字符串 key 冲突） */
export const formItemContextKey: InjectionKey<FormItemContext> =
  Symbol('formItemContextKey');
