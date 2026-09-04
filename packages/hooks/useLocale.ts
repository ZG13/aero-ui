import type { WritableComputedRef } from 'vue';
import { i18n } from '../locale';
import type { Locale } from '../locale';

export interface UseLocaleReturn {
  /** 翻译函数：按当前语言返回文案，缺失 key 回退默认语言或返回 key 本身 */
  t: (key: string) => string;
  /** 取消息数组（如周标题列表），缺失 key 返回空数组 */
  tm: (key: string) => unknown[];
  /** 当前语言（响应式） */
  locale: WritableComputedRef<Locale>;
  /** 切换语言 */
  setLocale: (lang: Locale) => void;
}

/**
 * locale 获取与切换入口。
 * 直接读取全局 i18n 单例的 global composer，确保 createI18n 副作用先于此处执行，
 * 且无需 app.use(i18n) 即可在测试与独立环境工作。
 */
export function useLocale(): UseLocaleReturn {
  const locale = i18n.global.locale as WritableComputedRef<Locale>;

  const t = (key: string): string => i18n.global.t(key) as string;

  const tm = (key: string): unknown[] =>
    (i18n.global.tm(key) as unknown[] | undefined) ?? [];

  const setLocale = (lang: Locale): void => {
    locale.value = lang;
  };

  return { t, tm, locale, setLocale };
}
