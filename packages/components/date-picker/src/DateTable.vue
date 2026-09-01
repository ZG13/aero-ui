<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Dayjs } from 'dayjs';
import { buildMonth, isSameDay, isInRange } from './date';

defineOptions({ name: 'AeroDateTable' });

const props = withDefaults(
  defineProps<{
    modelValue?: Dayjs | null;
    range?: [Dayjs | null, Dayjs | null];
    isRange?: boolean;
    disabledDate?: (date: Date) => boolean;
    currentMonth: Dayjs;
  }>(),
  {
    modelValue: null,
    range: () => [null, null],
    isRange: false,
  },
);

const emit = defineEmits<{
  (e: 'select', day: Dayjs): void;
  (e: 'update:currentMonth', day: Dayjs): void;
}>();

const currentMonth = ref(props.currentMonth);

const days = computed(() => buildMonth(currentMonth.value));

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

function isDisabled(day: Dayjs): boolean {
  return props.disabledDate ? props.disabledDate(day.toDate()) : false;
}

function isSelected(day: Dayjs): boolean {
  return isSameDay(day, props.modelValue);
}

function isRangeStart(day: Dayjs): boolean {
  return props.isRange && isSameDay(day, props.range?.[0] ?? null);
}

function isRangeEnd(day: Dayjs): boolean {
  return props.isRange && isSameDay(day, props.range?.[1] ?? null);
}

function isInRangeCell(day: Dayjs): boolean {
  if (!props.isRange) return false;
  const [start, end] = props.range ?? [null, null];
  if (!start || !end) return false;
  return isInRange(day, [start, end]);
}

function isOtherMonth(day: Dayjs): boolean {
  return day.month() !== currentMonth.value.month();
}

function prevMonth(): void {
  currentMonth.value = currentMonth.value.subtract(1, 'month');
  emit('update:currentMonth', currentMonth.value);
}

function nextMonth(): void {
  currentMonth.value = currentMonth.value.add(1, 'month');
  emit('update:currentMonth', currentMonth.value);
}

function selectDay(day: Dayjs): void {
  if (isDisabled(day)) return;
  emit('select', day);
}
</script>

<template>
  <div class="aero-date-table">
    <div class="aero-date-table__header">
      <button type="button" class="aero-date-table__nav" @click="prevMonth">&lt;</button>
      <span class="aero-date-table__title">
        {{ currentMonth.format('YYYY 年 M 月') }}
      </span>
      <button type="button" class="aero-date-table__nav" @click="nextMonth">&gt;</button>
    </div>

    <div class="aero-date-table__weekdays">
      <span v-for="w in weekdays" :key="w" class="aero-date-table__weekday">
        {{ w }}
      </span>
    </div>

    <div class="aero-date-table__grid">
      <div
        v-for="(day, index) in days"
        :key="index"
        class="aero-date-table__cell"
        :class="{
          'is-other-month': isOtherMonth(day),
          'is-selected': isSelected(day),
          'is-disabled': isDisabled(day),
          'is-range': isInRangeCell(day),
          'is-range-start': isRangeStart(day),
          'is-range-end': isRangeEnd(day),
        }"
        @click="selectDay(day)"
      >
        {{ day.date() }}
      </div>
    </div>
  </div>
</template>
