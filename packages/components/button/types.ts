export type ButtonType = 'primary' | 'default' | 'danger' | 'link';
export type ButtonSize = 'large' | 'main' | 'small';
export type ButtonNativeType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  /** @default 'default' */
  type?: ButtonType;
  /** @default 'main' */
  size?: ButtonSize;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  loading?: boolean;
  /** 图标名，经 AeroIcon 渲染 */
  icon?: string;
  /** @default 'button' */
  nativeType?: ButtonNativeType;
}

export interface ButtonEmits {
  (e: 'click', event: MouseEvent): void;
}
