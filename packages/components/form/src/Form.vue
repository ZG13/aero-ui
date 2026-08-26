<script setup lang="ts">
import { provide, reactive, ref, toRefs } from 'vue';
import { formContextKey } from './constants';
import type { FormContext, FormItemContext } from './constants';
import type { FormProps, FormEmits, ValidateFieldsError } from '../types';

defineOptions({ name: 'AeroForm' });

const props = withDefaults(defineProps<FormProps>(), {
  model: () => ({}),
  rules: () => ({}),
  labelWidth: 'auto',
  labelPosition: 'right',
  labelSuffix: '',
  inline: false,
  disabled: false,
  showMessage: true,
  statusIcon: false,
  scrollToError: false,
});

defineEmits<FormEmits>();

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
const {
  model,
  rules,
  size,
  disabled,
  labelWidth,
  labelPosition,
  inline,
  showMessage,
  statusIcon,
} = toRefs(props);

// 校验方法的最小实现（满足 FormContext 契约，可调用且不抛错）。
// 完整字段聚合逻辑在任务 3.2 中实现：validate/validateField 聚合遍历 fields，
// 失败 reject ValidateFieldsError；resetFields/clearValidate/scrollToField 更新字段状态。
async function validate(
  callback?: (valid: boolean, invalidFields?: ValidateFieldsError) => void,
): Promise<boolean> {
  callback?.(true);
  return true;
}

async function validateField(
  props?: string | string[],
  callback?: (valid: boolean, invalidFields?: ValidateFieldsError) => void,
): Promise<boolean> {
  void props;
  callback?.(true);
  return true;
}

function resetFields(props?: string | string[]): void {
  void props;
  // TODO(3.2): 将字段恢复至初始值并清除校验状态。
}

function clearValidate(props?: string | string[]): void {
  void props;
  // TODO(3.2): 清除指定/全部字段的校验状态与错误信息。
}

function scrollToField(prop: string): void {
  void prop;
  // TODO(3.2): 滚动到指定字段。
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
