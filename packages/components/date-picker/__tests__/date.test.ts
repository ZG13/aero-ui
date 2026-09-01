import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import { buildMonth, formatDate, isInRange, isSameDay, parseDate } from '../src/date';

describe('date 纯函数', () => {
  it('parseDate 解析 Date/string/number 并返回 Dayjs', () => {
    expect(parseDate('2024-01-15')?.format('YYYY-MM-DD')).toBe('2024-01-15');
    expect(parseDate(new Date(2024, 0, 15))?.format('YYYY-MM-DD')).toBe('2024-01-15');
    expect(parseDate('')).toBeNull();
    expect(parseDate('invalid')).toBeNull();
  });

  it('formatDate 格式化日期', () => {
    const d = dayjs('2024-03-05');
    expect(formatDate(d, 'YYYY-MM-DD')).toBe('2024-03-05');
    expect(formatDate(d, 'YYYY/MM/DD')).toBe('2024/03/05');
    expect(formatDate(null, 'YYYY-MM-DD')).toBe('');
  });

  it('buildMonth 生成 6×7 共 42 天，含前后月补位', () => {
    const d = dayjs('2024-01-15');
    const days = buildMonth(d);
    expect(days).toHaveLength(42);
    // 2024-01-01 是周一，startOf('week') 回到周日 2023-12-31
    expect(days[0].format('YYYY-MM-DD')).toBe('2023-12-31');
    expect(days[days.length - 1].format('YYYY-MM-DD')).toBe('2024-02-10');
  });

  it('isSameDay 判断同一天', () => {
    expect(isSameDay(dayjs('2024-01-15'), dayjs('2024-01-15'))).toBe(true);
    expect(isSameDay(dayjs('2024-01-15'), dayjs('2024-01-16'))).toBe(false);
    expect(isSameDay(null, dayjs('2024-01-15'))).toBe(false);
  });

  it('isInRange 判断闭区间', () => {
    const start = dayjs('2024-01-10');
    const end = dayjs('2024-01-20');
    expect(isInRange(dayjs('2024-01-10'), [start, end])).toBe(true);
    expect(isInRange(dayjs('2024-01-20'), [start, end])).toBe(true);
    expect(isInRange(dayjs('2024-01-09'), [start, end])).toBe(false);
    expect(isInRange(dayjs('2024-01-21'), [start, end])).toBe(false);
  });
});
