import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { Dayjs } from 'dayjs';

/**
 * 面板级 composable：范围选择状态机（element-plus 交互）。
 *
 * - 未选起始（selecting=false）：点击任意日期定为 start，进入选择中
 * - 选择中：hover 实时预览范围；点击 ≥ start 的日期完成；早于 start 则重设 start
 * - 已完成范围后再次点击：重新从 start 开始
 */

export interface UseRangeSelectionOptions {
  /** 选定起始日期时回调（透传 calendar-change） */
  onCalendarChange?: (start: Dayjs) => void;
  /** 完成选择回调：start ≤ end */
  onComplete: (range: [Dayjs, Dayjs]) => void;
}

export interface UseRangeSelectionReturn {
  /** 已确认范围（受控值同步） */
  committed: Ref<[Dayjs | null, Dayjs | null]>;
  /** 面板当前应展示的范围：选择中为 [start, hover 预览]，否则为已确认范围 */
  displayRange: ComputedRef<[Dayjs | null, Dayjs | null]>;
  /** 是否处于选择中（已定 start、未定 end） */
  selecting: Ref<boolean>;
  /** 受控值同步（外部 modelValue 变化时调用） */
  sync: (value: [Dayjs | null, Dayjs | null]) => void;
  /** 点击日期 */
  select: (day: Dayjs) => void;
  /** hover 预览：null 表示离开面板 */
  hover: (day: Dayjs | null) => void;
}

export function useRangeSelection(options: UseRangeSelectionOptions): UseRangeSelectionReturn {
  const committed = ref<[Dayjs | null, Dayjs | null]>([null, null]);
  const hoverEnd = ref<Dayjs | null>(null);
  const selecting = ref(false);

  const displayRange = computed<[Dayjs | null, Dayjs | null]>(() => {
    if (selecting.value && committed.value[0]) {
      return [committed.value[0], hoverEnd.value];
    }
    return committed.value;
  });

  function sync(value: [Dayjs | null, Dayjs | null]): void {
    committed.value = value;
    selecting.value = false;
    hoverEnd.value = null;
  }

  function select(day: Dayjs): void {
    const start = committed.value[0];
    if (!selecting.value || !start) {
      committed.value = [day, null];
      selecting.value = true;
      hoverEnd.value = null;
      options.onCalendarChange?.(day);
      return;
    }
    if (day.isBefore(start, 'day')) {
      // 早于起始：重设起始继续选择（对齐 element-plus）
      committed.value = [day, null];
      options.onCalendarChange?.(day);
      return;
    }
    selecting.value = false;
    hoverEnd.value = null;
    options.onComplete([start, day]);
  }

  function hover(day: Dayjs | null): void {
    if (selecting.value) hoverEnd.value = day;
  }

  return { committed, displayRange, selecting, sync, select, hover };
}
