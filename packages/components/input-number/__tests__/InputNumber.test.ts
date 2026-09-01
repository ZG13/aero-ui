import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, provide } from 'vue';
import type { PropType } from 'vue';
import { mount, enableAutoUnmount, type VueWrapper } from '@vue/test-utils';
import { afterEach } from 'vitest';
import AeroInputNumber from '../index';
import { formContextKey, formItemContextKey } from '../../form/src/constants';
import type { FormContext, FormItemContext } from '../../form/src/constants';

enableAutoUnmount(afterEach);

function mountInputNumber(props: Record<string, unknown> = {}) {
  return mount(AeroInputNumber, { props });
}

function innerInput(wrapper: VueWrapper) {
  return wrapper.find('.aero-input-number__inner');
}

function innerValue(wrapper: VueWrapper): string {
  return (innerInput(wrapper).element as HTMLInputElement).value;
}

describe('AeroInputNumber', () => {
  it('受控值同步到输入框', () => {
    const wrapper = mountInputNumber({ modelValue: 5 });
    expect(innerValue(wrapper)).toBe('5');
  });

  it('空值展示空输入框', () => {
    const wrapper = mountInputNumber({});
    expect(innerValue(wrapper)).toBe('');
  });

  it('非数值字符不录入', async () => {
    const wrapper = mountInputNumber({});
    await innerInput(wrapper).setValue('12a3');
    expect(innerValue(wrapper)).toBe('123');
  });

  it('点击增加按钮按 step 递增并派发事件', async () => {
    const wrapper = mountInputNumber({ modelValue: 5 });
    await wrapper.find('.aero-input-number__increase').trigger('click');
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([6]);
    expect(wrapper.emitted('change')!.at(-1)).toEqual([6]);
  });

  it('点击减少按钮按 step 递减', async () => {
    const wrapper = mountInputNumber({ modelValue: 5 });
    await wrapper.find('.aero-input-number__decrease').trigger('click');
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([4]);
  });

  it('controls=false 不渲染步进按钮', () => {
    const wrapper = mountInputNumber({ controls: false });
    expect(wrapper.find('.aero-input-number__controls').exists()).toBe(false);
  });

  it('到达边界对应步进按钮禁用', () => {
    const wrapper = mountInputNumber({ modelValue: 10, min: 0, max: 10 });
    expect(wrapper.find('.aero-input-number__increase').classes()).toContain('is-disabled');
    expect(wrapper.find('.aero-input-number__decrease').classes()).not.toContain('is-disabled');
  });

  it('越界输入被 clamp 到边界', async () => {
    const wrapper = mountInputNumber({ min: 0, max: 10 });
    await innerInput(wrapper).setValue('99');
    await innerInput(wrapper).trigger('blur');
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([10]);
  });

  it('precision 设置时四舍五入', async () => {
    const wrapper = mountInputNumber({ precision: 2 });
    await innerInput(wrapper).setValue('1.456');
    await innerInput(wrapper).trigger('blur');
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([1.46]);
  });

  it('stepStrictly 对齐到 step 倍数', async () => {
    const wrapper = mountInputNumber({ stepStrictly: true, step: 5 });
    await innerInput(wrapper).setValue('7');
    await innerInput(wrapper).trigger('blur');
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([5]);
  });

  it('非法输入失焦回退显示受控值，不派发', async () => {
    const wrapper = mountInputNumber({ modelValue: 5 });
    await innerInput(wrapper).setValue('abc');
    await innerInput(wrapper).trigger('blur');
    expect(innerValue(wrapper)).toBe('5');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('disabled 时输入框与步进按钮不可用', () => {
    const wrapper = mountInputNumber({ disabled: true });
    expect(innerInput(wrapper).attributes('disabled')).toBeDefined();
    expect(wrapper.find('.aero-input-number__increase').classes()).toContain('is-disabled');
  });

  it('readonly 时输入框只读但步进可用', () => {
    const wrapper = mountInputNumber({ readonly: true });
    expect(innerInput(wrapper).attributes('readonly')).toBeDefined();
    expect(wrapper.find('.aero-input-number__increase').classes()).not.toContain('is-disabled');
  });

  it('name 透传到内部输入元素', () => {
    const wrapper = mountInputNumber({ name: 'quantity' });
    expect(innerInput(wrapper).attributes('name')).toBe('quantity');
  });

  it('聚焦/失焦派发 focus/blur', async () => {
    const wrapper = mountInputNumber({});
    await innerInput(wrapper).trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();
    await innerInput(wrapper).trigger('blur');
    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('导出对象带 install 方法', () => {
    expect(typeof AeroInputNumber.install).toBe('function');
  });
});

// —— 表单上下文集成 ——

function makeFormContext(overrides: Partial<FormContext> = {}): FormContext {
  return {
    model: {},
    rules: {},
    size: undefined,
    disabled: false,
    labelWidth: 'auto',
    labelPosition: 'right',
    inline: false,
    showMessage: true,
    statusIcon: false,
    addField: () => {},
    removeField: () => {},
    validate: () => Promise.resolve(true),
    validateField: () => Promise.resolve(true),
    resetFields: () => {},
    clearValidate: () => {},
    scrollToField: () => {},
    ...overrides,
  };
}

function makeFormItemContext(overrides: Partial<FormItemContext> = {}): FormItemContext {
  return {
    prop: 'num',
    validate: () => Promise.resolve([]),
    resetField: () => {},
    clearValidate: () => {},
    validateState: '',
    validateMessage: '',
    size: undefined,
    disabled: false,
    ...overrides,
  };
}

const Provider = defineComponent({
  props: {
    form: { type: Object as PropType<FormContext> },
    formItem: { type: Object as PropType<FormItemContext> },
  },
  setup(props, { slots }) {
    if (props.form) provide(formContextKey, props.form);
    if (props.formItem) provide(formItemContextKey, props.formItem);
    return () => h('div', slots.default?.());
  },
});

function mountInContext(
  options: {
    props?: Record<string, unknown>;
    form?: FormContext;
    formItem?: FormItemContext;
  } = {},
) {
  return mount(Provider, {
    props: { form: options.form, formItem: options.formItem },
    slots: { default: () => h(AeroInputNumber, options.props ?? {}) },
  });
}

describe('AeroInputNumber 表单上下文集成', () => {
  it('继承表单级 size', () => {
    const wrapper = mountInContext({ form: makeFormContext({ size: 'large' }) });
    expect(wrapper.find('.aero-input-number').classes()).toContain('aero-input-number--large');
  });

  it('自身 size 覆盖表单级 size', () => {
    const wrapper = mountInContext({
      props: { size: 'small' },
      form: makeFormContext({ size: 'large' }),
    });
    expect(wrapper.find('.aero-input-number').classes()).toContain('aero-input-number--small');
    expect(wrapper.find('.aero-input-number').classes()).not.toContain('aero-input-number--large');
  });

  it('继承表单级 disabled', () => {
    const wrapper = mountInContext({ form: makeFormContext({ disabled: true }) });
    expect(innerInput(wrapper).attributes('disabled')).toBeDefined();
  });

  it('blur/change 触发字段即时校验', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const wrapper = mountInContext({
      props: { modelValue: 1 },
      formItem: makeFormItemContext({ validate }),
    });
    await innerInput(wrapper).trigger('blur');
    expect(validate).toHaveBeenCalledWith('blur');
    expect(validate).toHaveBeenCalledWith('change');
  });
});
