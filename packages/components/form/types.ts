/**
 * 表单尺寸语义：与 InputSize 对齐（large=大 / main=中 / small=小）
 */
export type FormSize = 'large' | 'main' | 'small';

/**
 * 表单项校验状态：
 * - ''：无校验状态（默认）
 * - 'error'：校验失败
 * - 'validating'：校验进行中
 */
export type FormItemValidateState = '' | 'error' | 'validating';

/**
 * 校验触发时机：
 * - blur：失焦时校验
 * - change：值变更时校验
 * - submit：提交（validate 调用）时校验
 */
export type FormValidateTrigger = 'blur' | 'change' | 'submit';

/**
 * 同步自定义校验函数
 * @param rule 当前触发校验的规则
 * @param value 字段当前值
 * @param callback 校验完成回调，传入错误信息（字符串或 Error）；校验通过时不传参或传空
 */
export type FormItemValidator = (
  rule: FormItemRule,
  value: unknown,
  callback: (error?: string | Error) => void,
) => void;

/**
 * 异步自定义校验函数
 * @param rule 当前触发校验的规则
 * @param value 字段当前值
 * @param callback 校验完成回调，传入错误信息（字符串或 Error）；校验通过时不传参或传空
 * @returns Promise，校验失败时 reject（携带错误信息）
 */
export type FormItemAsyncValidator = (
  rule: FormItemRule,
  value: unknown,
  callback: (error?: string | Error) => void,
) => Promise<void>;

/**
 * 单条校验规则（对齐 async-validator 的规则项，但采用严格类型，无 any）
 */
export interface FormItemRule {
  /** @default false 是否必填 */
  required?: boolean;
  /** 最小值 / 最小长度 */
  min?: number;
  /** 最大值 / 最大长度 */
  max?: number;
  /** 精确长度 */
  len?: number;
  /** 正则匹配 */
  pattern?: RegExp;
  /** 值类型 */
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'integer'
    | 'float'
    | 'array'
    | 'object'
    | 'date'
    | 'email'
    | 'url'
    | 'enum';
  /** 枚举允许的取值集合 */
  enum?: Array<string | number | boolean>;
  /** @default false 是否忽略首尾空格 */
  whitespace?: boolean;
  /** 自定义错误提示文案；缺省时回退到 locale 默认文案 */
  message?: string;
  /** 触发本规则校验的时机 */
  trigger?: FormValidateTrigger;
  /** 自定义同步校验函数 */
  validator?: FormItemValidator;
  /** 自定义异步校验函数 */
  asyncValidator?: FormItemAsyncValidator;
}

/**
 * 表单校验规则集合，key 为字段名（对应 FormItem 的 prop）
 */
export type FormRules = Record<string, FormItemRule | FormItemRule[]>;

/**
 * 单字段校验错误项：由 async-validator 归一化而来，仅保留 message 与 field。
 * 与 `ValidateFieldsError[prop]` 的元素形状一致。
 */
export type FieldError = { message: string; field: string };

/**
 * validate 校验失败时 reject 的错误结构，按字段名组织各字段错误信息
 */
export type ValidateFieldsError = Record<string, FieldError[]>;

/**
 * AeroForm 表单容器 props
 */
export interface FormProps {
  /** 表单数据对象 */
  model?: Record<string, unknown>;
  /** 校验规则 */
  rules?: FormRules;
  /** @default 'auto' 标签宽度 */
  labelWidth?: string | number;
  /** @default 'right' 标签位置 */
  labelPosition?: 'left' | 'right' | 'top';
  /** @default false 是否行内布局 */
  inline?: boolean;
  /** 表单级尺寸，传递给内部控件作为默认值 */
  size?: FormSize;
  /** @default false 是否禁用整表 */
  disabled?: boolean;
  /** @default true 是否展示校验消息 */
  showMessage?: boolean;
  /** @default false 是否展示校验状态图标 */
  statusIcon?: boolean;
  /** @default false 校验失败时是否滚动到第一个错误字段 */
  scrollToError?: boolean;
}

/**
 * AeroForm 表单容器事件
 */
export interface FormEmits {
  /** 字段校验完成后触发 */
  (e: 'validate', prop: string, isValid: boolean, message: string): void;
}
