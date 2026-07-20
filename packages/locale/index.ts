import { computed, inject, ref, type App, type InjectionKey, type Ref } from 'vue';

/** 组件内置文案结构 */
export interface EpLanguage {
  name: string;
  ep: {
    button: { loading: string };
    pagination: { prev: string; next: string };
    empty: { description: string };
    dialog: { confirm: string; cancel: string };
  };
}

import zhCn from './lang/zh-cn';

export const localeContextKey: InjectionKey<Ref<EpLanguage>> = Symbol('epLocaleContext');

const globalLocale = ref<EpLanguage>(zhCn);

/** 设置全局语言包 */
export function setLocale(lang: EpLanguage): void {
  globalLocale.value = lang;
}

/** 通过 app.provide 注入语言包（供应用级配置） */
export function provideLocale(app: App, lang: EpLanguage): void {
  globalLocale.value = lang;
  app.provide(localeContextKey, globalLocale);
}

/**
 * useLocale：组件内获取当前语言包与翻译函数。
 * 优先读取 inject 的上下文，回退到全局 locale。
 */
export function useLocale() {
  const injected = inject(localeContextKey, null);
  const locale = computed<EpLanguage>(() => injected?.value ?? globalLocale.value);

  /** 按点路径读取文案，如 t('ep.dialog.confirm') */
  const t = (path: string): string => {
    const keys = path.split('.');
    let result: unknown = locale.value;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }
    return typeof result === 'string' ? result : path;
  };

  return { locale, t };
}

export { zhCn };
export { default as en } from './lang/en';
