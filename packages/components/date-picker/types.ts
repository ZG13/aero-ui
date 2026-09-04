import type { Dayjs } from 'dayjs';

export type DatePickerType = 'date' | 'daterange';

/**
 * 单日期值。
 * 与 element-plus 对齐：清空时派发 null（而非 undefined）。
 */
export type DatePickerSingleValue = Date | string | number | null;

/** 范围值：[start, end]，清空时为 null */
export type DatePickerRangeValue = [DatePickerSingleValue, DatePickerSingleValue] | null;

/** 绑定值总类型：单日期 / 范围 / 未设置 */
export type DatePickerValue = DatePickerSingleValue | DatePickerRangeValue | undefined;

export interface DatePickerShortcut {
  /** 快捷项文案 */
  text: string;
  /** 返回选中值：单日期返回 Date，范围返回 [start, end] */
  value: (dayjs: Dayjs) => Date | [Date, Date];
}

export interface DatePickerProps {
  /** 绑定值：单日期为 Date|string|number|null，范围为 [start, end]|null */
  modelValue?: DatePickerValue;
  /** 面板类型 @default 'date' */
  type?: DatePickerType;
  /** 是否只读（输入框只读，面板仍可打开） */
  readonly?: boolean;
  /** 是否禁用（缺省继承表单级 disabled） */
  disabled?: boolean;
  /** 尺寸（缺省继承表单级 size） @default 'main' */
  size?: 'large' | 'main' | 'small';
  /** 输入框是否可手动输入 @default true */
  editable?: boolean;
  /** 是否可清空 @default false */
  clearable?: boolean;
  /** 单日期占位文案（缺省走 locale：请选择日期） */
  placeholder?: string;
  /** 范围起始占位（缺省走 locale：开始日期） */
  startPlaceholder?: string;
  /** 范围结束占位（缺省走 locale：结束日期） */
  endPlaceholder?: string;
  /** 范围分隔符 @default '-' */
  rangeSeparator?: string;
  /** 面板附加类名 */
  popperClass?: string;
  /** 面板回显格式 @default 'YYYY-MM-DD' */
  format?: string;
  /** 绑定值字符串格式（未设置时派发 Date 对象） */
  valueFormat?: string;
  /** 打开面板时定位的日期（其所在月/年） */
  defaultValue?: DatePickerSingleValue;
  /** 触发器前置图标（AeroIcon name） @default 'calendar' */
  prefixIcon?: string;
  /** 清除图标（AeroIcon name） @default 'close' */
  clearIcon?: string;
  /** 禁用日期判断函数，返回 true 的日期不可选 */
  disabledDate?: (date: Date) => boolean;
  /** 自定义单元格类名 */
  cellClassName?: (date: Date) => string;
  /** 面板左侧快捷选项 */
  shortcuts?: DatePickerShortcut[];
  /** 周起始日（0=周日 … 6=周六） @default 7 */
  firstDayOfWeek?: number;
  /** 面板是否 Teleport 到 body @default true */
  teleported?: boolean;
  /** 是否触发表单校验 @default true */
  validateEvent?: boolean;
  /** 范围面板左右日历是否互相独立 @default false */
  unlinkPanels?: boolean;
}

export interface DatePickerEmits {
  (e: 'update:modelValue', value: DatePickerValue): void;
  (e: 'change', value: DatePickerValue): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'clear'): void;
  (e: 'visible-change', visible: boolean): void;
  /** 范围选定起始日期时触发 */
  (e: 'calendar-change', value: [Date, Date | null]): void;
  /** 面板视图或所在月/年变化时触发 */
  (
    e: 'panel-change',
    date: Date,
    mode: 'date' | 'month' | 'year',
    view: 'date' | 'month' | 'year',
  ): void;
}

export type { Dayjs };
