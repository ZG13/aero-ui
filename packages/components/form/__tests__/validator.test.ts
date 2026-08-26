import { afterEach, describe, expect, it } from 'vitest';
import { validateFieldValue } from '../src/validator';
import { defaultLocale, i18n } from '../../../locale';
import type { FormItemRule } from '../types';

afterEach(() => {
  i18n.global.locale.value = defaultLocale;
});

/** 捕获 reject 值并断言其为按字段组织错误结构（ValidateFieldsError[prop]） */
async function captureRejection(
  value: unknown,
  rules: FormItemRule[],
  trigger?: Parameters<typeof validateFieldValue>[3],
): Promise<Array<{ message: string; field: string }>> {
  try {
    await validateFieldValue(value, rules, undefined, trigger);
  } catch (errors) {
    return errors as Array<{ message: string; field: string }>;
  }
  throw new Error('expected validateFieldValue to reject');
}

describe('validateFieldValue', () => {
  describe('required', () => {
    it('空值拒绝，非空值通过', async () => {
      await expect(validateFieldValue('', [{ required: true }])).rejects.toBeDefined();
      await expect(validateFieldValue('x', [{ required: true }])).resolves.toBeUndefined();
    });
  });

  describe('min / max / len', () => {
    it('min 规则通过 / 失败', async () => {
      await expect(validateFieldValue('ab', [{ min: 3 }])).rejects.toBeDefined();
      await expect(validateFieldValue('abc', [{ min: 3 }])).resolves.toBeUndefined();
    });

    it('max 规则通过 / 失败', async () => {
      await expect(validateFieldValue('abcd', [{ max: 3 }])).rejects.toBeDefined();
      await expect(validateFieldValue('abc', [{ max: 3 }])).resolves.toBeUndefined();
    });

    it('len 规则通过 / 失败', async () => {
      await expect(validateFieldValue('ab', [{ len: 3 }])).rejects.toBeDefined();
      await expect(validateFieldValue('abc', [{ len: 3 }])).resolves.toBeUndefined();
    });
  });

  describe('pattern', () => {
    it('正则不匹配拒绝，匹配通过', async () => {
      await expect(validateFieldValue('abc', [{ pattern: /^\d+$/ }])).rejects.toBeDefined();
      await expect(validateFieldValue('123', [{ pattern: /^\d+$/ }])).resolves.toBeUndefined();
    });
  });

  describe('type', () => {
    it('类型不合法拒绝，合法通过', async () => {
      await expect(validateFieldValue('not-an-email', [{ type: 'email' }])).rejects.toBeDefined();
      await expect(validateFieldValue('a@b.com', [{ type: 'email' }])).resolves.toBeUndefined();
    });
  });

  describe('enum', () => {
    it('值不在枚举中拒绝，在枚举中通过', async () => {
      const rules: FormItemRule[] = [{ type: 'enum', enum: ['a', 'b'] }];
      await expect(validateFieldValue('c', rules)).rejects.toBeDefined();
      await expect(validateFieldValue('a', rules)).resolves.toBeUndefined();
    });
  });

  describe('自定义 validator（同步）', () => {
    it('回调错误拒绝，回调空通过', async () => {
      const rules: FormItemRule[] = [
        {
          validator: (_rule, value, callback) => {
            if (value !== 'ok') callback('sync error');
            else callback();
          },
        },
      ];
      await expect(validateFieldValue('bad', rules)).rejects.toBeDefined();
      await expect(validateFieldValue('ok', rules)).resolves.toBeUndefined();
    });

    it('同步 validator 错误消息透传', async () => {
      const rules: FormItemRule[] = [
        {
          validator: (_rule, _value, callback) => callback('sync error'),
        },
      ];
      const errors = await captureRejection('x', rules);
      expect(errors[0].message).toBe('sync error');
    });
  });

  describe('自定义 asyncValidator', () => {
    it('异步拒绝通过 / 失败', async () => {
      const rules: FormItemRule[] = [
        {
          asyncValidator: async (_rule, value) => {
            if (value !== 'ok') throw new Error('async error');
          },
        },
      ];
      await expect(validateFieldValue('bad', rules)).rejects.toBeDefined();
      await expect(validateFieldValue('ok', rules)).resolves.toBeUndefined();
    });

    it('异步 validator 错误消息透传', async () => {
      const rules: FormItemRule[] = [
        {
          asyncValidator: async () => {
            throw new Error('async error');
          },
        },
      ];
      const errors = await captureRejection('x', rules);
      expect(errors[0].message).toBe('async error');
    });
  });

  describe('默认文案（locale 兜底）', () => {
    it('required 缺 message 时回退 locale 默认文案', async () => {
      const errors = await captureRejection('', [{ required: true }]);
      expect(errors[0].message).toBe('该字段为必填项');
    });

    it('min 缺 message 时回退 locale 默认文案并插值数值', async () => {
      const errors = await captureRejection('ab', [{ min: 3 }]);
      expect(errors[0].message).toBe('不能小于 3');
    });

    it('max 缺 message 时回退 locale 默认文案并插值数值', async () => {
      const errors = await captureRejection('a'.repeat(11), [{ max: 10 }]);
      expect(errors[0].message).toBe('不能大于 10');
    });

    it('len 缺 message 时回退 locale 默认文案并插值数值', async () => {
      const errors = await captureRejection('abcd', [{ len: 5 }]);
      expect(errors[0].message).toBe('长度必须为 5');
    });

    it('pattern 缺 message 时回退 locale 默认文案', async () => {
      const errors = await captureRejection('abc', [{ pattern: /^\d+$/ }]);
      expect(errors[0].message).toBe('格式不正确');
    });

    it('显式 message 优先于 locale 默认文案', async () => {
      const errors = await captureRejection('', [{ required: true, message: '自定义必填' }]);
      expect(errors[0].message).toBe('自定义必填');
    });
  });

  describe('locale 切换（需求 7.2）', () => {
    it('切换到 en 后默认错误文案更新为英文', async () => {
      i18n.global.locale.value = 'en';
      const errors = await captureRejection('', [{ required: true }]);
      expect(errors[0].message).toBe('This field is required');
    });

    it('切回 zh-cn 后默认错误文案更新为中文', async () => {
      i18n.global.locale.value = 'en';
      i18n.global.locale.value = 'zh-cn';
      const errors = await captureRejection('', [{ required: true }]);
      expect(errors[0].message).toBe('该字段为必填项');
    });

    it('双向切换时文案随语言实时更新', async () => {
      i18n.global.locale.value = 'en';
      expect((await captureRejection('', [{ required: true }]))[0].message).toBe(
        'This field is required',
      );
      i18n.global.locale.value = 'zh-cn';
      expect((await captureRejection('', [{ required: true }]))[0].message).toBe(
        '该字段为必填项',
      );
    });
  });

  describe('trigger 过滤', () => {
    it('规则 trigger 不匹配时跳过校验', async () => {
      await expect(
        validateFieldValue('', [{ required: true, trigger: 'blur' }], undefined, 'change'),
      ).resolves.toBeUndefined();
    });

    it('规则 trigger 匹配时执行校验', async () => {
      await expect(
        validateFieldValue('', [{ required: true, trigger: 'blur' }], undefined, 'blur'),
      ).rejects.toBeDefined();
    });

    it('无 trigger 的规则始终执行', async () => {
      await expect(
        validateFieldValue('', [{ required: true }], undefined, 'change'),
      ).rejects.toBeDefined();
    });

    it('未传 trigger 时执行所有规则（含带 trigger 的规则）', async () => {
      await expect(
        validateFieldValue('', [{ required: true, trigger: 'submit' }]),
      ).rejects.toBeDefined();
    });
  });

  describe('错误结构归一化', () => {
    it('reject 值为 { message, field } 数组，与 ValidateFieldsError[prop] 一致', async () => {
      const errors = await captureRejection('', [
        { required: true },
        { pattern: /^\d+$/ },
      ]);
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThanOrEqual(1);
      for (const error of errors) {
        expect(typeof error.message).toBe('string');
        expect(typeof error.field).toBe('string');
      }
    });

    it('无错误时 resolve 且不携带结果', async () => {
      await expect(validateFieldValue('abc', [{ min: 1 }])).resolves.toBeUndefined();
    });
  });
});
