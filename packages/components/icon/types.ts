export interface IconProps {
  /** 内置图标集的 key，如 loading / close / search */
  name: string;
  /** 尺寸，数字按 px，默认 1em */
  size?: number | string;
  /** 颜色，默认 currentColor */
  color?: string;
}
