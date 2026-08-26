import Schema from 'async-validator';
import type { RuleItem, Values } from 'async-validator';
import { i18n } from '../../../locale';
import type { FormItemRule, FormValidateTrigger } from '../types';

/**
 * 单字段校验错误项，与 `ValidateFieldsError[prop]` 的元素形状一致。
 * 由 async-validator 的 `ValidateError` 归一化而来，仅保留 message 与 field。
 */
interface FieldError {
  message: string;
  field: string;
}

/**
 * 规则缺失 `message` 时，按规则主类型映射 locale 默认文案 key：
 * `components.form.rules.<type>`，兜底 `components.form.rules.default`。
 *
 * `min`/`max`/`len` 的 locale 文案含 `{min}`/`{max}`/`{len}` 命名插值占位符，
 * 需通过 vue-i18n 的 named 参数填充数值，否则占位符会被剥离成空（如 "不能小于 "）。
 */
function resolveDefaultMessage(rule: FormItemRule): string {
  let key:
    | 'required'
    | 'min'
    | 'max'
    | 'len'
    | 'pattern'
    | 'type'
    | 'enum'
    | 'whitespace'
    | 'default';

  if (rule.required) {
    key = 'required';
  } else if (rule.len !== undefined) {
    key = 'len';
  } else if (rule.min !== undefined) {
    key = 'min';
  } else if (rule.max !== undefined) {
    key = 'max';
  } else if (rule.pattern !== undefined) {
    key = 'pattern';
  } else if (rule.type === 'enum' || rule.enum !== undefined) {
    key = 'enum';
  } else if (rule.type !== undefined) {
    key = 'type';
  } else if (rule.whitespace !== undefined) {
    key = 'whitespace';
  } else {
    key = 'default';
  }

  switch (key) {
    case 'min':
      return i18n.global.t('components.form.rules.min', { min: rule.min });
    case 'max':
      return i18n.global.t('components.form.rules.max', { max: rule.max });
    case 'len':
      return i18n.global.t('components.form.rules.len', { len: rule.len });
    default:
      return i18n.global.t(`components.form.rules.${key}`);
  }
}

/**
 * 受控 `as` 边界：将 aero 严格 `FormItemRule` 适配为 async-validator `RuleItem`。
 * 除 validator/asyncValidator 的调用签名外，字段类型可直通；此处的类型断言
 * 仅存在于本模块，公共类型（types.ts）保持严格、无 any。
 */
function toRuleItem(rule: FormItemRule): RuleItem {
  const item: RuleItem = {};

  if (rule.required !== undefined) item.required = rule.required;
  if (rule.min !== undefined) item.min = rule.min;
  if (rule.max !== undefined) item.max = rule.max;
  if (rule.len !== undefined) item.len = rule.len;
  if (rule.pattern !== undefined) item.pattern = rule.pattern;
  if (rule.type !== undefined) item.type = rule.type;
  if (rule.enum !== undefined) item.enum = rule.enum;
  if (rule.whitespace !== undefined) item.whitespace = rule.whitespace;

  // 自定义 validator/asyncValidator 自行产出错误信息（经 callback/throw），
  // 此时若不显式指定 message，则不设置 message，避免覆盖其错误文案。
  const hasCustomValidator = !!rule.validator || !!rule.asyncValidator;
  if (rule.message !== undefined) {
    item.message = rule.message;
  } else if (!hasCustomValidator) {
    item.message = resolveDefaultMessage(rule);
  }

  if (rule.validator) {
    item.validator = rule.validator as unknown as RuleItem['validator'];
  }
  if (rule.asyncValidator) {
    item.asyncValidator = rule.asyncValidator as unknown as RuleItem['asyncValidator'];
  }

  return item;
}

/** 将 async-validator 的 rejection（{ errors, fields }）归一化为 `{ message, field }` 数组。 */
function normalizeErrors(error: unknown): FieldError[] {
  if (!error || typeof error !== 'object') return [];

  const errors = (error as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return [];

  return errors
    .map((entry): FieldError | null => {
      if (!entry || typeof entry !== 'object') return null;
      const { message, field } = entry as { message?: unknown; field?: unknown };
      return {
        message: typeof message === 'string' ? message : '',
        field: typeof field === 'string' ? field : '',
      };
    })
    .filter((entry): entry is FieldError => entry !== null);
}

/**
 * 校验单字段值。
 *
 * 将严格 `FormItemRule[]` 适配为 async-validator 规则并执行；规则缺失 `message`
 * 时回退 locale 默认文案；`trigger` 用于过滤应执行的规则：
 * - 未传 `trigger`（如 submit 全量校验）时执行所有规则；
 * - 传入 `trigger`（blur/change 即时校验）时仅执行无 `trigger` 或 `trigger` 匹配的规则。
 *
 * @param value 字段当前值（model[prop]）
 * @param rules 字段校验规则
 * @param fieldLabel 字段标签（用于错误归属，可缺省）
 * @param trigger 触发时机，过滤规则用；缺省表示全量执行
 * @returns 校验通过 resolve；失败 reject `{ message, field }[]`（即 `ValidateFieldsError[prop]`）
 */
export async function validateFieldValue(
  value: unknown,
  rules: FormItemRule[],
  fieldLabel?: string,
  trigger?: FormValidateTrigger,
): Promise<void> {
  const activeRules =
    trigger === undefined
      ? rules
      : rules.filter((rule) => !rule.trigger || rule.trigger === trigger);

  if (activeRules.length === 0) return;

  const field = fieldLabel ?? 'value';
  const descriptor: Record<string, RuleItem[]> = {
    [field]: activeRules.map((rule) => toRuleItem(rule)),
  };
  const source: Values = { [field]: value };

  const validator = new Schema(descriptor);

  try {
    await validator.validate(source);
  } catch (error) {
    const errors = normalizeErrors(error);
    if (errors.length > 0) {
      throw errors;
    }
  }
}
