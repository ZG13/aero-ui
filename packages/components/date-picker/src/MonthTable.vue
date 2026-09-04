<script setup lang="ts">
import { computed } from 'vue';
import type { Dayjs } from 'dayjs';
import { isSameDay, isToday } from './date';

defineOptions({ name: 'AeroMonthTable' });

// element-plus 结构：4×3 十二个月网格，标签由面板经 locale 传入（如「1月」/「Jan」）
const props = withDefaults(
  defineProps<{
    /** 定位年月（仅取年份） */
    month: Dayjs;
    /** 当前选中日期（用于高亮所属月份） */
    selected?: Dayjs | null;
    disabledDate?: (date: Date) => boolean;
    cellClassName?: (date: Date) => string;
    /** 12 个月标签 */
    labels?: string[];
  }>(),
  {
    selected: null,
    labels: () => ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
);

const emit = defineEmits<{
  /** 点击月份，day 为该月 1 号 */
  (e: 'select', day: Dayjs): void;
}>();

const cells = computed(() =>
  Array.from({ length: 12 }, (_, i) => props.month.month(i).startOf('month')),
);

function isDisabled(day: Dayjs): boolean {
  return props.disabledDate ? props.disabledDate(day.toDate()) : false;
}

function isSelected(day: Dayjs): boolean {
  return isSameDay(props.selected?.startOf('month') ?? null, day);
}

function cellClass(day: Dayjs): Record<string, boolean> {
  const classes: Record<string, boolean> = {
    'is-selected': isSelected(day),
    'is-disabled': isDisabled(day),
    'is-today': isToday(day),
  };
  const extra = props.cellClassName?.(day.toDate());
  if (extra) classes[extra] = true;
  return classes;
}

function selectMonth(day: Dayjs): void {
  if (isDisabled(day)) return;
  emit('select', day);
}
</script>

<template>
  <div class="aero-month-table">
    <div class="aero-month-table__grid">
      <div
        v-for="(day, index) in cells"
        :key="index"
        class="aero-month-table__cell"
        :class="cellClass(day)"
        @click="selectMonth(day)"
      >
        <span class="aero-month-table__cell-text">{{ labels?.[index] ?? index + 1 }}</span>
      </div>
    </div>
  </div>
</template>
