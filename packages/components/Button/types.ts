/** 按钮类型 */
export type EpButtonType = 'primary' | 'success' | 'danger' | 'warning' | 'info';

/** 按钮尺寸 */
export type EpButtonSize = 'mini' | 'small' | 'middle' | 'large';

/** 按钮视觉样式：实心 / 描边 / 无底 */
export type EpButtonVariant = 'solid' | 'plain' | 'none';

/** 原生按钮 type 属性 */
export type EpButtonNativeType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  /** 按钮类型 @default 'primary' */
  type?: EpButtonType;
  /** 按钮尺寸 @default 'middle' */
  size?: EpButtonSize;
  /** 视觉样式：实心/描边/无底 @default 'solid' */
  variant?: EpButtonVariant;
  /** 是否圆角（full radius） @default false */
  round?: boolean;
  /** 是否禁用 @default false */
  disabled?: boolean;
  /** 是否加载中 @default false */
  loading?: boolean;
  /** 左侧图标名 */
  icon?: string;
  /** 右侧图标名 */
  suffixIcon?: string;
  /** 原生 button type @default 'button' */
  nativeType?: EpButtonNativeType;
}

export interface ButtonEmits {
  (e: 'click', event: MouseEvent): void;
}
