<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  useSlots,
  watch,
} from 'vue';
import { formContextKey, formItemContextKey } from '../../form/src/constants';
import type { FormItemContext } from '../../form/src/constants';
import { validateFieldValue } from '../../form/src/validator';
import type { FieldError, FormItemRule, FormItemValidateState, FormValidateTrigger } from '../../form/types';
import type { FormItemProps, FormItemEmits } from '../types';
import AeroIcon from '../../icon';

defineOptions({ name: 'AeroFormItem' });

// 关键：disabled/showMessage 显式默认 undefined，绕过 Vue 布尔 prop 的
// 「未声明 → false」强转，使「未声明」与「声明 false」可区分，从而能按
// 「自身 → 表单级 → 默认」折叠（见 2.2 契约）。
const props = withDefaults(defineProps<FormItemProps>(), {
  label: '',
  required: false,
  showMessage: undefined,
  disabled: undefined,
});

const emit = defineEmits<FormItemEmits>();

const slots = useSlots();

const formContext = inject(formContextKey, undefined);

// 继承折叠：自身 prop → 表单级 → 默认。disabled 折叠后为 boolean（2.2 契约）。
const size = computed(() => props.size ?? formContext?.size);
const disabled = computed(() => props.disabled ?? formContext?.disabled ?? false);
const showMessage = computed(
  () => props.showMessage ?? formContext?.showMessage ?? true,
);

// 标签宽度：表单项级覆盖表单级；数值归一化为 px，字符串透传（2.3）。
const labelWidth = computed(() => props.labelWidth ?? formContext?.labelWidth);
const labelStyle = computed<Record<string, string> | undefined>(() => {
  const width = labelWidth.value;
  if (width === undefined) return undefined;
  return { width: typeof width === 'number' ? `${width}px` : width };
});

// 字段校验状态：初始化自手动校验状态 prop，并随其变更同步。
const validateState = ref<FormItemValidateState>(props.validateStatus ?? '');
const validateMessage = ref('');

watch(
  () => props.validateStatus,
  (value) => {
    if (value !== undefined) {
      validateState.value = value;
    }
  },
);

/** 解析有效校验规则：表单项级 `props.rules` 覆盖表单级 `formContext.rules[prop]`（3.4）。 */
function getEffectiveRules(): FormItemRule[] {
  if (props.rules !== undefined && props.rules !== null) {
    return Array.isArray(props.rules) ? props.rules : [props.rules];
  }
  const prop = props.prop;
  if (prop && formContext) {
    const formRule = formContext.rules[prop];
    if (formRule !== undefined && formRule !== null) {
      return Array.isArray(formRule) ? formRule : [formRule];
    }
  }
  return [];
}

/** 必填星号：`props.required` 或有效规则中含 `required: true`（3.3）。 */
const isRequired = computed(() => {
  if (props.required) return true;
  return getEffectiveRules().some((rule) => rule.required === true);
});

/** 展示的错误文案：手动 `props.error` 覆盖校验产生的消息。 */
const errorText = computed(() => props.error ?? validateMessage.value);

const hasError = computed(() => !!errorText.value);

const shouldShowError = computed(() => hasError.value && showMessage.value);

/** 状态图标：statusIcon 开启时按校验状态渲染（error → close / validating → loading）。 */
const statusIconName = computed(() => {
  if (validateState.value === 'validating') return 'loading';
  if (hasError.value) return 'close';
  return '';
});

const showStatusIcon = computed(
  () => !!formContext?.statusIcon && statusIconName.value !== '',
);

const statusIconColor = computed(() =>
  statusIconName.value === 'close'
    ? 'var(--aero-danger-6)'
    : 'var(--aero-neutral-10)',
);

/**
 * 字段级校验：解析有效规则，调用 validateFieldValue 执行，更新 validateState /
 * validateMessage。全量路径（trigger === undefined）通过 resolve `[]`，失败 reject
 * 字段错误列表 `FieldError[]`（即 `ValidateFieldsError[prop]`），供 AeroForm 聚合。
 * blur/change 触发时由子控件（AeroInput）作为副作用调用，resolve `[]` 不 reject。
 */
async function validate(trigger?: FormValidateTrigger): Promise<FieldError[]> {
  const prop = props.prop;
  if (!prop || !formContext) return [];

  const rules = getEffectiveRules();

  if (rules.length === 0) {
    validateState.value = '';
    validateMessage.value = '';
    emit('validate', prop, true, '');
    return [];
  }

  validateState.value = 'validating';

  try {
    await validateFieldValue(formContext.model[prop], rules, prop, trigger);
    validateState.value = '';
    validateMessage.value = '';
    emit('validate', prop, true, '');
    return [];
  } catch (errors) {
    const list: FieldError[] = Array.isArray(errors)
      ? (errors as FieldError[])
      : [];
    const message = list.length > 0 ? list[0].message : '';
    validateState.value = 'error';
    validateMessage.value = message;
    emit('validate', prop, false, message);
    // 仅全量/提交校验（trigger === undefined，由 Form.validate 经 field.validate(undefined)
    // 驱动）需要以 reject 携带错误列表供聚合；blur/change 即时校验由子控件（AeroInput）
    // 作为 fire-and-forget 副作用调用，须 resolve 以避免产生未处理的 Promise 拒绝（3.3）。
    if (trigger === undefined) {
      throw list;
    }
    return [];
  }
}

/** 重置字段：恢复模型初始值（委托表单级 resetFields）并清除校验状态。 */
function resetField(): void {
  if (props.prop && formContext) {
    formContext.resetFields(props.prop);
  } else {
    clearValidate();
  }
}

/** 清除字段校验状态与错误信息。 */
function clearValidate(): void {
  validateState.value = '';
  validateMessage.value = '';
}

// 字段级上下文：prop/validate/resetField/clearValidate/validateState/validateMessage/
// size/disabled。validateState/validateMessage 以 ref 注入 reactive，自动解包。
const formItemContext: FormItemContext = reactive({
  prop: props.prop ?? '',
  validate,
  resetField,
  clearValidate,
  validateState,
  validateMessage,
  size,
  disabled,
});

provide(formItemContextKey, formItemContext);

// 生命周期：有 prop 才注册字段（无 prop 仅作纯展示项，不纳入校验/重置，4.7）；
// 卸载时注销。无 formContext 时安全跳过，不抛错。
onMounted(() => {
  if (props.prop) {
    formContext?.addField(formItemContext);
  }
});

onBeforeUnmount(() => {
  formContext?.removeField(formItemContext);
});
</script>

<template>
  <div
    class="aero-form-item"
    :class="{
      'is-error': hasError,
      'is-required': isRequired,
      'is-validating': validateState === 'validating',
    }"
    :data-prop="prop || undefined"
  >
    <label
      v-if="label || slots.label"
      class="aero-form-item__label"
      :style="labelStyle"
    >
      <slot name="label">
        <span v-if="isRequired" class="aero-form-item__required">*</span>
        {{ label }}
      </slot>
    </label>

    <div class="aero-form-item__content">
      <slot />

      <div v-if="shouldShowError" class="aero-form-item__error">
        <slot name="error" :error="errorText">{{ errorText }}</slot>
      </div>

      <AeroIcon
        v-if="showStatusIcon"
        class="aero-form-item__status-icon"
        :name="statusIconName"
        :color="statusIconColor"
      />
    </div>
  </div>
</template>
