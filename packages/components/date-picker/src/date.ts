import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { DatePickerSingleValue, DatePickerValue } from '../types';

/**
 * dayjs 薄封装：日期解析/格式化/月历生成/范围判断/序列化。
 * 无副作用，集中 dayjs 调用，避免组件散落日期逻辑。
 */

// 严格解析（按 format 手动输入）依赖 customParseFormat 插件
dayjs.extend(customParseFormat);

/** 将外部值解析为 Dayjs；无法解析返回 null */
export function parseDate(value: DatePickerSingleValue): Dayjs | null {
  if (value === undefined || value === null || value === '') return null;
  const d = dayjs(value as dayjs.ConfigType);
  return d.isValid() ? d : null;
}

/** 按 format 严格解析手动输入；失败返回 null */
export function parseStrict(value: string, format: string): Dayjs | null {
  const text = value.trim();
  if (!text) return null;
  const d = dayjs(text, format, true);
  return d.isValid() ? d : null;
}

/** 格式化日期 */
export function formatDate(day: Dayjs | null, fmt: string): string {
  return day ? day.format(fmt) : '';
}

/** 序列化为绑定值：valueFormat 字符串，否则 Date 对象 */
export function serializeDate(day: Dayjs, valueFormat?: string): DatePickerSingleValue {
  return valueFormat ? day.format(valueFormat) : day.toDate();
}

/** 生成某月对应的 6×7 日期矩阵（含前后月补位），每行 7 天，共 42 天。
 *  firstDayOfWeek 为周起始日：0=周日 … 6=周六，默认 7（周日，对齐 element-plus） */
export function buildMonth(month: Dayjs, firstDayOfWeek = 7): Dayjs[] {
  const first = month.startOf('month');
  const offset = (first.day() - firstDayOfWeek + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => first.subtract(offset, 'day').add(i, 'day'));
}

/** 判断两个日期是否为同一天 */
export function isSameDay(a: Dayjs | null, b: Dayjs | null): boolean {
  if (!a || !b) return false;
  return a.isSame(b, 'day');
}

/** 判断某日是否在闭区间 [start, end] 内（自动归一化方向） */
export function isInRange(day: Dayjs, start: Dayjs, end: Dayjs): boolean {
  const [from, to] = start.isBefore(end, 'day') ? [start, end] : [end, start];
  return !day.isBefore(from, 'day') && !day.isAfter(to, 'day');
}

/** 是否为今天 */
export function isToday(day: Dayjs): boolean {
  return day.isSame(dayjs(), 'day');
}

/** 年份所处十年区间起始（如 2025 → 2020） */
export function decadeStart(year: number): number {
  return Math.floor(year / 10) * 10;
}

/** 提取范围绑定值的起止日期 */
export function parseRangeValue(value: DatePickerValue): [Dayjs | null, Dayjs | null] {
  if (!Array.isArray(value)) return [null, null];
  return [parseDate(value[0]), parseDate(value[1])];
}

/** 提取单值绑定值 */
export function parseSingleValue(value: DatePickerValue): Dayjs | null {
  if (Array.isArray(value)) return null;
  return parseDate(value ?? null);
}
