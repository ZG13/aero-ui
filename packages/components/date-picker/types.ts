export type DatePickerType = 'date' | 'daterange';

export type DatePickerValue = Date | string | number;
export type DatePickerRangeValue = [DatePickerValue, DatePickerValue];

export interface DatePickerProps {
  /** 绑定值：单日期为 Date|string|number，范围为 [start, end] */
  modelValue?: DatePickerValue | DatePickerRangeValue;
  /** 类型 @default 'date' */
  type?: DatePickerType;
  /** 触发器展示格式 @default 'YYYY-MM-DD' */
  format?: string;
  /** 绑定值字符串格式（未设置时派发 Date 对象） */
  valueFormat?: string;
  /** 占位文案（单日期） */
  placeholder?: string;
  /** 范围起始占位 */
  startPlaceholder?: string;
  /** 范围结束占位 */
  endPlaceholder?: string;
  /** 是否禁用（缺省继承表单级 disabled） */
  disabled?: boolean;
  /** 尺寸（缺省继承表单级 size） @default 'main' */
  size?: 'large' | 'main' | 'small';
  /** 禁用日期判断函数，返回 true 的日期不可选 */
  disabledDate?: (date: Date) => boolean;
  /** 是否可清空 @default false */
  clearable?: boolean;
  /** 是否可编辑（false 时输入框只读） @default true */
  editable?: boolean;
}

export interface DatePickerEmits {
  (e: 'update:modelValue', value: DatePickerValue | DatePickerRangeValue | undefined): void;
  (e: 'change', value: DatePickerValue | DatePickerRangeValue | undefined): void;
  (e: 'clear'): void;
  (e: 'visible-change', visible: boolean): void;
}
