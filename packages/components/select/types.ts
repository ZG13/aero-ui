export type SelectSize = 'large' | 'main' | 'small';

export interface SelectProps {
  /** 绑定值：单选为 string | number，多选（multiple）为数组 */
  modelValue?: string | number | (string | number)[];
  /** @default false 是否多选 */
  multiple?: boolean;
  /** @default false 是否可清空 */
  clearable?: boolean;
  /** @default false 是否可搜索（本地过滤） */
  filterable?: boolean;
  /** 占位文案（未提供时回退到 locale 默认文案） */
  placeholder?: string;
  /** 是否禁用（缺省继承表单级 disabled） */
  disabled?: boolean;
  /** 尺寸（缺省继承表单级 size） */
  size?: SelectSize;
}

export interface SelectEmits {
  (e: 'update:modelValue', value: string | number | (string | number)[] | undefined): void;
  (e: 'change', value: string | number | (string | number)[] | undefined): void;
  (e: 'clear'): void;
  (e: 'visible-change', visible: boolean): void;
}

export interface OptionProps {
  /** 选项标签（回显与搜索匹配用） */
  label?: string | number;
  /** 选项值 */
  value?: string | number;
  /** @default false 是否禁用该选项 */
  disabled?: boolean;
}
