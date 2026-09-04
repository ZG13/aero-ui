export interface IconProps {
  /** 内置图标集的 key，如 search / close / loading / settings / link / calendar / arrow-left 等 */
  name: string;
  /** 尺寸，数字按 px，默认 1em */
  size?: number | string;
  /** 颜色，默认 var(--aero-neutral-10)（= $coolgrey-10） */
  color?: string;
}
