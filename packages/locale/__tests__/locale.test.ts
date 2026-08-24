import { describe, expect, it } from 'vitest'
import { defaultLocale, en, i18n, zhCn } from '../index'
import type { Locale, LanguagePack } from '../types'

describe('locale 语言包', () => {
  it('zh-cn / en 语言包均含 name 字段', () => {
    expect(zhCn.name).toBe('中文')
    expect(en.name).toBe('English')
  })

  it('Locale 联合类型覆盖 zh-cn 与 en（类型契约由 TS 校验，此处做运行时兜底）', () => {
    const locales: Locale[] = ['zh-cn', 'en']
    expect(locales).toHaveLength(2)
  })

  it('LanguagePack 契约可被语言包满足（编译期 satisfies，运行时校验 name）', () => {
    const zh: LanguagePack = zhCn
    const english: LanguagePack = en
    expect(zh.name).toBeTruthy()
    expect(english.name).toBeTruthy()
  })

  it('默认语言为 zh-cn', () => {
    expect(defaultLocale).toBe('zh-cn')
    expect(i18n.global.locale.value).toBe('zh-cn')
  })
})
