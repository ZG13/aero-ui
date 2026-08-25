export type ButtonType = 'primary' | 'default' | 'danger' | 'link';
// 尺寸语义：large=36px / default=32px / small=28px / mini=24px
export type ButtonSize = 'large' | 'default' | 'small' | 'mini';
export type ButtonNativeType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  /** @default 'default' */
  type?: ButtonType;
  /** @default 'default' */
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
