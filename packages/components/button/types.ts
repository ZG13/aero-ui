export type ButtonType = 'primary' | 'info' | 'success' | 'warning' | 'danger';
export type ButtonVariant = 'solid' | 'plain' | 'none';
// 尺寸语义：large=36px / default=32px / small=28px / mini=24px
export type ButtonSize = 'large' | 'default' | 'small' | 'mini';
export type ButtonShape = 'default' | 'round';
export type ButtonIconPosition = 'left' | 'right';
export type ButtonNativeType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  /** @default 'info' */
  type?: ButtonType;
  /** @default 'solid' */
  variant?: ButtonVariant;
  /** @default 'default' */
  size?: ButtonSize;
  /** @default 'default' */
  shape?: ButtonShape;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  loading?: boolean;
  /** 图标名，经 AeroIcon 渲染 */
  icon?: string;
  /** @default 'left' */
  iconPosition?: ButtonIconPosition;
  /** @default 'button' */
  nativeType?: ButtonNativeType;
}

export interface ButtonEmits {
  (e: 'click', event: MouseEvent): void;
}
