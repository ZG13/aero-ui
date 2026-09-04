<script setup lang="ts">
import { computed } from 'vue';
import type { Dayjs } from 'dayjs';
import { decadeStart, isSameDay, isToday } from './date';

defineOptions({ name: 'AeroYearTable' });

// element-plus 结构：4×3 网格展示十年，首尾为相邻十年补位（灰色，可点击跳十年）
const props = withDefaults(
  defineProps<{
    /** 定位年月（仅取年份） */
    month: Dayjs;
    /** 当前选中日期（用于高亮所属年份） */
    selected?: Dayjs | null;
    disabledDate?: (date: Date) => boolean;
    cellClassName?: (date: Date) => string;
  }>(),
  {
    selected: null,
  },
);

const emit = defineEmits<{
  /** 点击年份，day 为该年 1 月 1 日 */
  (e: 'select', day: Dayjs): void;
}>();

const startYear = computed(() => decadeStart(props.month.year()) - 1);

const cells = computed(() =>
  Array.from({ length: 12 }, (_, i) => props.month.year(startYear.value + i).startOf('year')),
);

function isDisabled(day: Dayjs): boolean {
  return props.disabledDate ? props.disabledDate(day.toDate()) : false;
}

function isOtherDecade(day: Dayjs): boolean {
  return day.year() === startYear.value || day.year() === startYear.value + 11;
}

function isSelected(day: Dayjs): boolean {
  return isSameDay(props.selected?.startOf('year') ?? null, day);
}

function cellClass(day: Dayjs): Record<string, boolean> {
  const classes: Record<string, boolean> = {
    'is-other-decade': isOtherDecade(day),
    'is-selected': isSelected(day),
    'is-disabled': isDisabled(day),
    'is-today': isToday(day),
  };
  const extra = props.cellClassName?.(day.toDate());
  if (extra) classes[extra] = true;
  return classes;
}

function selectYear(day: Dayjs): void {
  if (isDisabled(day)) return;
  emit('select', day);
}
</script>

<template>
  <div class="aero-year-table">
    <div class="aero-year-table__grid">
      <div
        v-for="(day, index) in cells"
        :key="index"
        class="aero-year-table__cell"
        :class="cellClass(day)"
        @click="selectYear(day)"
      >
        <span class="aero-year-table__cell-text">{{ day.year() }}</span>
      </div>
    </div>
  </div>
</template>
