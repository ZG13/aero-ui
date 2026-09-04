<script setup lang="ts">
import { computed } from 'vue';
import type { Dayjs } from 'dayjs';
import { buildMonth, isSameDay, isInRange, isToday } from './date';

defineOptions({ name: 'AeroDateTable' });

// element-plus 结构：表格只有周标题行 + 6×7 网格，月份导航由面板 header 承担
const props = withDefaults(
  defineProps<{
    /** 该格展示的月份 */
    month: Dayjs;
    /** 单选选中日期 */
    selected?: Dayjs | null;
    /** 范围起点（含 hover 预览） */
    rangeStart?: Dayjs | null;
    /** 范围终点（含 hover 预览） */
    rangeEnd?: Dayjs | null;
    isRange?: boolean;
    disabledDate?: (date: Date) => boolean;
    cellClassName?: (date: Date) => string;
    /** 周起始日：0=周日 … 6=周六，默认 7（周日，对齐 element-plus） */
    firstDayOfWeek?: number;
    /** 键盘导航聚焦日期 */
    focusedDate?: Dayjs | null;
    /** 周标题文案（从 firstDayOfWeek 起排列），由面板经 locale 传入 */
    weekdays?: string[];
  }>(),
  {
    selected: null,
    rangeStart: null,
    rangeEnd: null,
    isRange: false,
    firstDayOfWeek: 7,
    focusedDate: null,
    weekdays: () => ['日', '一', '二', '三', '四', '五', '六'],
  },
);

const emit = defineEmits<{
  /** 点击日期（含前后月补位），面板负责跳月 */
  (e: 'select', day: Dayjs): void;
  /** hover 预览：进入单元格传日期，离开整表传 null */
  (e: 'hover', day: Dayjs | null): void;
}>();

// 周标题按 firstDayOfWeek 旋转（如 firstDayOfWeek=1 时为 一二三四五六日）
const weekdays = computed(() => {
  const all = props.weekdays ?? [];
  return all.slice(props.firstDayOfWeek!).concat(all.slice(0, props.firstDayOfWeek!));
});

const days = computed(() => buildMonth(props.month, props.firstDayOfWeek));

function isDisabled(day: Dayjs): boolean {
  return props.disabledDate ? props.disabledDate(day.toDate()) : false;
}

function isSelected(day: Dayjs): boolean {
  return isSameDay(day, props.selected) || isRangeStart(day) || isRangeEnd(day);
}

function isRangeStart(day: Dayjs): boolean {
  return props.isRange && isSameDay(day, props.rangeStart);
}

function isRangeEnd(day: Dayjs): boolean {
  return props.isRange && isSameDay(day, props.rangeEnd);
}

function isInRangeCell(day: Dayjs): boolean {
  if (!props.isRange) return false;
  const { rangeStart: start, rangeEnd: end } = props;
  if (!start || !end || isSameDay(start, end)) return false;
  return isInRange(day, start, end);
}

function cellClass(day: Dayjs): Record<string, boolean> {
  const classes: Record<string, boolean> = {
    'is-other-month': day.month() !== props.month.month(),
    'is-selected': isSelected(day),
    'is-range-start': isRangeStart(day),
    'is-range-end': isRangeEnd(day),
    'is-in-range': isInRangeCell(day),
    'is-disabled': isDisabled(day),
    'is-today': isToday(day),
    'is-focused': isSameDay(day, props.focusedDate),
  };
  const extra = props.cellClassName?.(day.toDate());
  if (extra) classes[extra] = true;
  return classes;
}

function selectDay(day: Dayjs): void {
  if (isDisabled(day)) return;
  emit('select', day);
}

function hoverDay(day: Dayjs): void {
  if (isDisabled(day)) return;
  emit('hover', day);
}
</script>

<template>
  <div class="aero-date-table" @mouseleave="emit('hover', null)">
    <div class="aero-date-table__weekdays">
      <span v-for="w in weekdays" :key="w" class="aero-date-table__weekday">{{ w }}</span>
    </div>

    <div class="aero-date-table__grid">
      <div
        v-for="(day, index) in days"
        :key="index"
        class="aero-date-table__cell"
        :class="cellClass(day)"
        @click="selectDay(day)"
        @mouseenter="hoverDay(day)"
      >
        <span class="aero-date-table__cell-text">{{ day.date() }}</span>
      </div>
    </div>
  </div>
</template>
