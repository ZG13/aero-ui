import dayjs, { type Dayjs } from 'dayjs';
import type { DatePickerValue } from '../types';

/**
 * dayjs 薄封装：日期解析/格式化/月历生成/范围判断。
 * 无副作用，集中 dayjs 调用，避免组件散落日期逻辑。
 */

/** 将外部值解析为 Dayjs；无法解析返回 null */
export function parseDate(value: DatePickerValue): Dayjs | null {
  if (value === undefined || value === null || value === '') return null;
  const d = dayjs(value as dayjs.ConfigType);
  return d.isValid() ? d : null;
}

/** 格式化日期 */
export function formatDate(day: Dayjs | null, fmt: string): string {
  return day ? day.format(fmt) : '';
}

/** 生成某月对应的 6×7 日期矩阵（含前后月补位），每行 7 天，共 42 天 */
export function buildMonth(day: Dayjs): Dayjs[] {
  const start = day.startOf('month').startOf('week');
  return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
}

/** 判断两个日期是否为同一天 */
export function isSameDay(a: Dayjs | null, b: Dayjs | null): boolean {
  if (!a || !b) return false;
  return a.isSame(b, 'day');
}

/** 判断某日是否在闭区间 [start, end] 内 */
export function isInRange(day: Dayjs, range: [Dayjs, Dayjs]): boolean {
  return !day.isBefore(range[0], 'day') && !day.isAfter(range[1], 'day');
}
