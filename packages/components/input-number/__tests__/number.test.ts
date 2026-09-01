import { describe, expect, it } from 'vitest';
import { alignStep, clamp, decrease, increase, toPrecision } from '../src/number';

describe('number 纯函数', () => {
  it('clamp 将值限制在 [min, max]', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('toPrecision 四舍五入到指定小数位', () => {
    expect(toPrecision(1.5, 2)).toBe(1.5);
    expect(toPrecision(1.456, 2)).toBe(1.46);
    expect(toPrecision(2, undefined)).toBe(2);
  });

  it('alignStep 对齐到最近 step 倍数', () => {
    expect(alignStep(7, 5)).toBe(5);
    expect(alignStep(8, 5)).toBe(10);
    expect(alignStep(0.25, 0.1)).toBe(0.3);
  });

  it('increase/decrease 按 step 增减并 clamp', () => {
    expect(increase(5, 1, 0, 10)).toBe(6);
    expect(decrease(5, 1, 0, 10)).toBe(4);
    expect(increase(10, 1, 0, 10)).toBe(10);
    expect(decrease(0, 1, 0, 10)).toBe(0);
  });

  it('空值步进以 min / 0 或 max / 0 为起点', () => {
    expect(increase(undefined, 1, 5, 10)).toBe(6);
    expect(increase(undefined, 1, -Infinity, 10)).toBe(1);
    expect(decrease(undefined, 1, 0, 10)).toBe(9);
  });

  it('precision 与 min/max 组合：先 clamp 后 toPrecision', () => {
    expect(increase(1.5, 0.1, 0, 2, 2)).toBe(1.6);
    expect(decrease(1.5, 0.1, 0, 2, 2)).toBe(1.4);
    expect(increase(2, 0.1, 0, 2, 2)).toBe(2);
  });
});
