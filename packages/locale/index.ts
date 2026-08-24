import { createI18n } from 'vue-i18n'
import zhCn from './lang/zh-cn'
import en from './lang/en'
import type { Locale, LanguagePack } from './types'

/** 默认语言 */
export const defaultLocale: Locale = 'zh-cn'

/** 全局 i18n 单例（legacy: false，组合式 API；vue-i18n 作为 external 依赖不进产物） */
export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    'zh-cn': zhCn,
    en,
  },
})

export { zhCn, en }
export type { Locale, LanguagePack }
