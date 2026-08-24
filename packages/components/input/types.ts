export type InputSize = 'large' | 'main' | 'small';

export interface InputProps {
  modelValue?: string | number;
  placeholder?: string;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  clearable?: boolean;
  /** @default 'main' */
  size?: InputSize;
}

export interface InputEmits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'input', value: string | number): void;
  (e: 'change', value: string | number): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'clear'): void;
}
