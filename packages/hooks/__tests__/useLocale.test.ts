import { describe, expect, it } from 'vitest';
import { useLocale } from '../useLocale';

describe('useLocale', () => {
  it('返回 { t, locale, setLocale } 三要素', () => {
    const { t, locale, setLocale } = useLocale();
    expect(typeof t).toBe('function');
    expect(locale).toBeDefined();
    expect(typeof setLocale).toBe('function');
  });

  it('默认 locale 为 zh-cn，t(name) 返回「中文」', () => {
    const { t, locale } = useLocale();
    expect(locale.value).toBe('zh-cn');
    expect(t('name')).toBe('中文');
  });

  it('setLocale("en") 后 t(name) 返回 "English"', () => {
    const { t, setLocale, locale } = useLocale();
    setLocale('en');
    expect(locale.value).toBe('en');
    expect(t('name')).toBe('English');
  });

  it('缺失 key 不抛错（返回 key 本身）', () => {
    const { t } = useLocale();
    expect(() => t('不存在.key')).not.toThrow();
    expect(t('不存在.key')).toBe('不存在.key');
  });
});
