<script setup lang="ts">
import { provide, reactive, ref, toRefs } from 'vue';
import { formContextKey } from './constants';
import type { FormContext, FormItemContext } from './constants';
import type { FormProps, FormEmits, ValidateFieldsError, FieldError } from '../types';

defineOptions({ name: 'AeroForm' });

const props = withDefaults(defineProps<FormProps>(), {
  model: () => ({}),
  rules: () => ({}),
  labelWidth: 'auto',
  labelPosition: 'right',
  inline: false,
  disabled: false,
  showMessage: true,
  statusIcon: false,
  scrollToError: false,
});

const emit = defineEmits<FormEmits>();

// 字段注册表：AeroFormItem 挂载/卸载时通过 addField/removeField 维护。
const fields = ref<FormItemContext[]>([]);

function addField(field: FormItemContext): void {
  fields.value.push(field);
}

function removeField(field: FormItemContext): void {
  const index = fields.value.indexOf(field);
  if (index !== -1) {
    fields.value.splice(index, 1);
  }
}

// 布局/尺寸/禁用等 props 以 ref 形式下发，供子 FormItem 响应式消费。
const { model, rules, size, disabled, labelWidth, labelPosition, inline, showMessage, statusIcon } =
  toRefs(props);

/**
 * 深拷贝（仅覆盖普通对象与数组，表单 model 数据为纯数据）。
 * resetFields 用其恢复初始值，避免直接引用 model 原引用（改动即污染快照）。
 */
function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = cloneValue((value as Record<string, unknown>)[key]);
    }
    return result;
  }
  return value;
}

// 表单挂载时的 model 初始快照，供 resetFields 恢复。
const initialValues = cloneValue(props.model) as Record<string, unknown>;

/** 注册字段中 prop 非空的字段名列表（无 prop 的字段不纳入校验/重置范围）。 */
function getRegisteredProps(): string[] {
  return fields.value.map((field) => field.prop).filter((prop) => prop !== '');
}

/** 归一化 props 参数（undefined → 全部注册字段；string → [string]）。 */
function resolveProps(props?: string | string[]): string[] {
  if (props === undefined) {
    return getRegisteredProps();
  }
  return Array.isArray(props) ? props : [props];
}

/**
 * 校验一组字段：逐字段调用其 `FormItemContext.validate()`，让字段级校验状态
 * （validateState/validateMessage）收敛于 FormItem，并聚合失败结果。每字段触发
 * `validate` 事件（prop/isValid/message）。通过 resolve true；失败（无 callback）
 * reject `ValidateFieldsError`；有 callback 时以 (valid, invalidFields) 回调而不 reject。
 */
async function runValidation(
  propsList: string[],
  callback?: (valid: boolean, invalidFields?: ValidateFieldsError) => void,
): Promise<boolean> {
  const invalidFields: ValidateFieldsError = {};

  for (const prop of propsList) {
    const field = fields.value.find((item) => item.prop === prop);
    if (!field) continue;

    try {
      await field.validate(undefined);
      emit('validate', prop, true, '');
    } catch (errors) {
      const list: FieldError[] = Array.isArray(errors) ? errors : [];
      invalidFields[prop] = list;
      emit('validate', prop, false, list.map((e) => e.message).join(''));
    }
  }

  const valid = Object.keys(invalidFields).length === 0;

  if (!valid && props.scrollToError) {
    const firstInvalidProp = Object.keys(invalidFields)[0];
    if (firstInvalidProp !== undefined) {
      scrollToField(firstInvalidProp);
    }
  }

  if (callback) {
    callback(valid, valid ? undefined : invalidFields);
    return valid;
  }

  if (!valid) {
    throw invalidFields;
  }
  return true;
}

/** 校验全部已注册字段。 */
async function validate(
  callback?: (valid: boolean, invalidFields?: ValidateFieldsError) => void,
): Promise<boolean> {
  return runValidation(getRegisteredProps(), callback);
}

/** 校验指定字段（未传 props 时校验全部已注册字段）。 */
async function validateField(
  props?: string | string[],
  callback?: (valid: boolean, invalidFields?: ValidateFieldsError) => void,
): Promise<boolean> {
  return runValidation(resolveProps(props), callback);
}

/** 将指定/全部字段恢复至初始值，并清除校验状态。 */
function resetFields(props?: string | string[]): void {
  for (const prop of resolveProps(props)) {
    if (Object.prototype.hasOwnProperty.call(initialValues, prop)) {
      model.value[prop] = cloneValue(initialValues[prop]);
    }
    const field = fields.value.find((item) => item.prop === prop);
    field?.clearValidate();
  }
}

/** 清除指定/全部字段的校验状态，不重置值。 */
function clearValidate(props?: string | string[]): void {
  for (const prop of resolveProps(props)) {
    const field = fields.value.find((item) => item.prop === prop);
    field?.clearValidate();
  }
}

/**
 * 滚动到指定字段。通过 `data-prop` 属性定位表单项根元素（3.3 的 AeroFormItem
 * 根元素需渲染 `data-prop`），调用 `scrollIntoView` 滚动至可见。元素不存在时
 * 安全 no-op；SSR 环境下无 `document` 同样安全返回。
 */
function scrollToField(prop: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  const el = document.querySelector<HTMLElement>(`[data-prop="${prop}"]`);
  el?.scrollIntoView();
}

const context: FormContext & { fields: FormItemContext[] } = reactive({
  model,
  rules,
  size,
  disabled,
  labelWidth,
  labelPosition,
  inline,
  showMessage,
  statusIcon,
  fields,
  addField,
  removeField,
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
});

provide(formContextKey, context);

// 暴露校验与重置等实例方法，供消费者经模板 ref 调用（对齐 element-plus 的 el-form 实例 API）。
defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
});
</script>

<template>
  <form
    class="aero-form"
    :class="[
      { 'aero-form--inline': inline },
      size ? `aero-form--${size}` : '',
      `aero-form--label-${labelPosition}`,
      { 'is-disabled': disabled },
    ]"
  >
    <slot />
  </form>
</template>
