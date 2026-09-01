/**
 * 数字输入框的数值计算纯函数。
 *
 * 无副作用、无 Vue 依赖，供 AeroInputNumber 的步进与提交逻辑复用，可独立单测。
 * 约定：所有归一化遵循「先 clamp 后 toPrecision」顺序，返回值恒落在 [min, max]。
 */

/** 获取数值的小数位数（浮点精度处理用） */
function getPrecision(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const str = String(value);
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : str.length - dot - 1;
}

/** 将数值 clamp 到 [min, max] */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 四舍五入到指定小数位；precision 未设置时原样返回 */
export function toPrecision(value: number, precision?: number): number {
  if (precision === undefined) return value;
  return Number(value.toFixed(precision));
}

/** 将数值对齐到最近 step 倍数（浮点安全，按 step 小数位归一） */
export function alignStep(value: number, step: number): number {
  if (step <= 0) return value;
  const precision = Math.max(getPrecision(value), getPrecision(step));
  const factor = 10 ** precision;
  const aligned = Math.round((value * factor) / (step * factor)) * step;
  return Number(aligned.toFixed(precision));
}

/** 增加一个 step；空值以 min（若有限）否则 0 为起点 */
export function increase(
  value: number | undefined,
  step: number,
  min: number,
  max: number,
  precision?: number,
): number {
  const base = value !== undefined ? value : min > -Infinity ? min : 0;
  const next = clamp(base + step, min, max);
  return toPrecision(next, precision);
}

/** 减少一个 step；空值以 max（若有限）否则 0 为起点 */
export function decrease(
  value: number | undefined,
  step: number,
  min: number,
  max: number,
  precision?: number,
): number {
  const base = value !== undefined ? value : max < Infinity ? max : 0;
  const next = clamp(base - step, min, max);
  return toPrecision(next, precision);
}
