import { useDark, useToggle } from '@vueuse/core';
import type { Ref } from 'vue';

export type ThemeMode = 'light' | 'dark';

export interface UseThemeReturn {
  /** 当前是否为暗色模式 */
  isDark: Ref<boolean>;
  /** 切换明暗模式 */
  toggleDark: (value?: boolean) => boolean;
}

/**
 * 主题 Hook：切换根节点 .ep-theme-light / .ep-theme-dark 类名，并持久化到 localStorage。
 * @description 基于 VueUse 的 useDark，selector 挂载在 <html> 上。
 */
export function useTheme(): UseThemeReturn {
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'ep-theme-dark',
    valueLight: 'ep-theme-light',
    storageKey: 'ep-theme',
  });

  const toggleDark = useToggle(isDark);

  return { isDark, toggleDark };
}
