import { computed, onBeforeUnmount, onMounted, ref, type ComputedRef, type Ref } from 'vue';

export interface UsePopperOptions {
  trigger: Ref<HTMLElement | null>;
  panel: Ref<HTMLElement | null>;
  /**
   * 面板宽度是否跟随触发器宽度。默认 true（如 Select 场景）；
   * 设为 false 时面板宽度由内容决定（如 DatePicker 固定日历宽度）。
   */
  matchTriggerWidth?: boolean;
}

export interface UsePopperReturn {
  open: Ref<boolean>;
  panelStyle: ComputedRef<{ top: string; left: string; width?: string }>;
  openPanel: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * 通用弹层定位 hook：负责弹层展开/收起、相对触发器的 fixed 定位，
 * 以及滚动/resize 收起、click-outside 与 Escape 关闭。
 *
 * 面板通常 Teleport 到 body，脱离触发器的定位上下文，故用触发器的
 * getBoundingClientRect 计算 fixed + viewport 坐标。
 */
export function usePopper(options: UsePopperOptions): UsePopperReturn {
  const { trigger, panel, matchTriggerWidth = true } = options;
  const open = ref(false);

  const panelStyle = computed(() => {
    const rect = trigger.value?.getBoundingClientRect();
    if (!rect) return { top: '0', left: '0', width: '0' };
    return {
      top: `${rect.bottom}px`,
      left: `${rect.left}px`,
      width: matchTriggerWidth ? `${rect.width}px` : undefined,
    };
  });

  function openPanel(): void {
    open.value = true;
  }

  function close(): void {
    open.value = false;
  }

  function toggle(): void {
    open.value ? close() : openPanel();
  }

  function handleDocumentClick(event: MouseEvent): void {
    if (!open.value) return;
    const target = event.target as Node;
    if (trigger.value && trigger.value.contains(target)) return;
    if (panel.value && panel.value.contains(target)) return;
    close();
  }

  function handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && open.value) {
      close();
    }
  }

  function handleViewportChange(event: Event): void {
    if (!open.value) return;
    if (panel.value && panel.value.contains(event.target as Node)) return;
    close();
  }

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick, true);
    document.addEventListener('keydown', handleDocumentKeydown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick, true);
    document.removeEventListener('keydown', handleDocumentKeydown);
    window.removeEventListener('resize', handleViewportChange);
    window.removeEventListener('scroll', handleViewportChange, true);
  });

  return { open, panelStyle, openPanel, close, toggle };
}
