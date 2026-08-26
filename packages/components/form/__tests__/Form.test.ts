import { describe, expect, it } from 'vitest';
import { defineComponent, h, inject } from 'vue';
import { mount } from '@vue/test-utils';
import AeroForm from '../src/Form.vue';
import { formContextKey } from '../src/constants';
import type { FormContext, FormItemContext } from '../src/constants';

/**
 * AeroForm 通过 `provide(formContextKey, ...)` 下发的上下文，额外暴露 `fields`
 * 字段注册数组（供字段生命周期断言）。`FormContext` 契约本身未声明 `fields`，
 * 此处为测试观察内部注册状态而放宽类型。
 */
type ProvidedFormContext = FormContext & { fields: FormItemContext[] };

function makeFormItemContext(
  overrides: Partial<FormItemContext> = {},
): FormItemContext {
  return {
    prop: 'name',
    validate: () => Promise.resolve(),
    resetField: () => {},
    clearValidate: () => {},
    validateState: '',
    validateMessage: '',
    size: undefined,
    disabled: false,
    ...overrides,
  };
}

/** 注入 formContextKey 并捕获到外部变量，供断言读取上下文。 */
function mountWithCapture(): {
  wrapper: ReturnType<typeof mount>;
  context: ProvidedFormContext;
} {
  let captured: ProvidedFormContext | undefined;

  const Probe = defineComponent({
    setup() {
      captured = inject(formContextKey) as ProvidedFormContext;
      return () => h('span');
    },
  });

  const wrapper = mount(AeroForm, {
    slots: { default: () => h(Probe) },
  });

  return { wrapper, context: captured as ProvidedFormContext };
}

describe('AeroForm', () => {
  it('渲染 <form> 且含 aero-form 类', () => {
    const wrapper = mount(AeroForm);
    const form = wrapper.find('form');
    expect(form.exists()).toBe(true);
    expect(form.classes()).toContain('aero-form');
  });

  it('inline/size/label-position/disabled 产生对应修饰类', () => {
    const wrapper = mount(AeroForm, {
      props: {
        inline: true,
        size: 'small',
        labelPosition: 'top',
        disabled: true,
      },
    });
    const form = wrapper.find('form');
    expect(form.classes()).toContain('aero-form--inline');
    expect(form.classes()).toContain('aero-form--small');
    expect(form.classes()).toContain('aero-form--label-top');
    expect(form.classes()).toContain('is-disabled');
  });

  it('默认 label-position=right 产生 label-right，且无 inline/size 修饰类', () => {
    const wrapper = mount(AeroForm);
    const form = wrapper.find('form');
    expect(form.classes()).toContain('aero-form--label-right');
    expect(form.classes()).not.toContain('aero-form--inline');
    expect(form.classes()).not.toContain('aero-form--small');
  });

  it('provide 上下文：子组件可读取 model/rules/size/disabled', () => {
    let captured: ProvidedFormContext | undefined;
    const Probe = defineComponent({
      setup() {
        captured = inject(formContextKey) as ProvidedFormContext;
        return () => h('span');
      },
    });

    const model = { name: 'aero' };
    mount(AeroForm, {
      props: {
        model,
        rules: { name: { required: true } },
        size: 'large',
        disabled: true,
      },
      slots: { default: () => h(Probe) },
    });

    expect(captured).toBeDefined();
    // model 经 Vue 响应式代理包裹，断言深相等并核对字段内容，而非引用相等
    expect(captured!.model).toEqual(model);
    expect(captured!.model.name).toBe('aero');
    expect(captured!.rules).toEqual({ name: { required: true } });
    expect(captured!.size).toBe('large');
    expect(captured!.disabled).toBe(true);
  });

  it('model 缺省时默认为空对象，不抛错', () => {
    const { wrapper, context } = mountWithCapture();
    expect(wrapper.find('form').exists()).toBe(true);
    expect(context.model).toEqual({});
  });

  it('addField/removeField 更新 fields 注册数组', () => {
    const { context } = mountWithCapture();
    const field = makeFormItemContext({ prop: 'name' });

    context.addField(field);
    expect(context.fields).toHaveLength(1);

    context.removeField(field);
    expect(context.fields).toHaveLength(0);
  });

  it('validate/validateField/resetFields/clearValidate/scrollToField 契约方法可调用且不抛错', async () => {
    const { context } = mountWithCapture();

    await expect(context.validate()).resolves.toBe(true);
    await expect(context.validateField('name')).resolves.toBe(true);
    expect(() => context.resetFields()).not.toThrow();
    expect(() => context.clearValidate()).not.toThrow();
    expect(() => context.scrollToField('name')).not.toThrow();
  });
});
