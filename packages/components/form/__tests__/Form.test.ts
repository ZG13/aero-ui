import { describe, expect, it, vi } from 'vitest';
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

/**
 * 构造一个字段级校验会失败（validate reject 指定错误列表）的字段上下文。
 * 3.3 起 Form.validate() 委托 `field.validate()` 聚合错误，故字段自身 validate 的结果
 * 即为该字段的校验结果（字段级 rules 走同一路径）。
 */
function makeFailingField(
  prop: string,
  message: string,
  overrides: Partial<FormItemContext> = {},
): FormItemContext {
  return makeFormItemContext({
    prop,
    validate: () => Promise.reject([{ message, field: prop }]),
    ...overrides,
  });
}

/** 注入 formContextKey 并捕获到外部变量，供断言读取上下文。 */
function mountWithCapture(props?: Record<string, unknown>): {
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
    props,
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

  // ─────────────────────────────── 3.2 校验方法 ───────────────────────────────

  it('validate: 全部字段通过时 resolve true', async () => {
    const { context } = mountWithCapture({
      model: { name: 'aero' },
      rules: { name: { required: true, message: '姓名必填' } },
    });
    context.addField(makeFormItemContext({ prop: 'name' }));

    await expect(context.validate()).resolves.toBe(true);
  });

  it('validate: 字段校验失败时 reject 以 prop 为 key 的错误结构', async () => {
    const { context } = mountWithCapture({
      model: { name: '' },
      rules: { name: { required: true, message: '姓名必填' } },
    });
    context.addField(makeFailingField('name', '姓名必填'));

    await expect(context.validate()).rejects.toEqual({
      name: [{ message: '姓名必填', field: 'name' }],
    });
  });

  it('validate: 多字段部分失败时聚合全部错误字段', async () => {
    const { context } = mountWithCapture({
      model: { name: '', email: 'aero' },
      rules: {
        name: { required: true, message: '姓名必填' },
        email: { required: true, message: '邮箱必填' },
      },
    });
    context.addField(makeFailingField('name', '姓名必填'));
    context.addField(makeFormItemContext({ prop: 'email' }));

    await expect(context.validate()).rejects.toEqual({
      name: [{ message: '姓名必填', field: 'name' }],
    });
  });

  it('validate: 传入 callback 时以 (valid, invalidFields) 调用且不 reject', async () => {
    const { context } = mountWithCapture({
      model: { name: '' },
      rules: { name: { required: true, message: '姓名必填' } },
    });
    context.addField(makeFailingField('name', '姓名必填'));

    const callback = vi.fn();
    const result = await context.validate(callback);

    expect(result).toBe(false);
    expect(callback).toHaveBeenCalledWith(false, {
      name: [{ message: '姓名必填', field: 'name' }],
    });
  });

  it('validate: 全部通过时 callback 收到 (true, undefined)', async () => {
    const { context } = mountWithCapture({
      model: { name: 'aero' },
      rules: { name: { required: true, message: '姓名必填' } },
    });
    context.addField(makeFormItemContext({ prop: 'name' }));

    const callback = vi.fn();
    const result = await context.validate(callback);

    expect(result).toBe(true);
    expect(callback).toHaveBeenCalledWith(true, undefined);
  });

  it('validateField: 仅校验指定字段，忽略其它字段', async () => {
    const { context } = mountWithCapture({
      model: { name: '', email: '' },
      rules: {
        name: { required: true, message: '姓名必填' },
        email: { required: true, message: '邮箱必填' },
      },
    });
    context.addField(makeFailingField('name', '姓名必填'));
    context.addField(makeFailingField('email', '邮箱必填'));

    await expect(context.validateField('name')).rejects.toEqual({
      name: [{ message: '姓名必填', field: 'name' }],
    });
  });

  it('validateField: 指定字段通过时 resolve true', async () => {
    const { context } = mountWithCapture({
      model: { name: 'aero', email: '' },
      rules: {
        name: { required: true, message: '姓名必填' },
        email: { required: true, message: '邮箱必填' },
      },
    });
    context.addField(makeFormItemContext({ prop: 'name' }));
    context.addField(makeFailingField('email', '邮箱必填'));

    await expect(context.validateField('name')).resolves.toBe(true);
  });

  it('resetFields: 恢复模型初始值并清除字段校验状态', () => {
    const { context } = mountWithCapture({
      model: { name: 'initial' },
      rules: {},
    });
    const clearValidate = vi.fn();
    context.addField(makeFormItemContext({ prop: 'name', clearValidate }));

    context.model.name = 'changed';
    context.resetFields();

    expect(context.model.name).toBe('initial');
    expect(clearValidate).toHaveBeenCalledTimes(1);
  });

  it('resetFields: 无参数时重置全部字段', () => {
    const { context } = mountWithCapture({
      model: { name: 'initial', email: 'a@b.c' },
      rules: {},
    });
    const clearName = vi.fn();
    const clearEmail = vi.fn();
    context.addField(makeFormItemContext({ prop: 'name', clearValidate: clearName }));
    context.addField(makeFormItemContext({ prop: 'email', clearValidate: clearEmail }));

    context.model.name = 'changed';
    context.model.email = 'changed@b.c';
    context.resetFields();

    expect(context.model.name).toBe('initial');
    expect(context.model.email).toBe('a@b.c');
    expect(clearName).toHaveBeenCalledTimes(1);
    expect(clearEmail).toHaveBeenCalledTimes(1);
  });

  it('clearValidate: 清除校验状态但不重置值', () => {
    const { context } = mountWithCapture({
      model: { name: 'changed' },
      rules: {},
    });
    const clearValidate = vi.fn();
    context.addField(makeFormItemContext({ prop: 'name', clearValidate }));

    context.clearValidate();

    expect(context.model.name).toBe('changed');
    expect(clearValidate).toHaveBeenCalledTimes(1);
  });

  it('validate: 触发 validate 事件（prop/isValid/message）', async () => {
    const { wrapper, context } = mountWithCapture({
      model: { name: '', email: 'aero' },
      rules: {
        name: { required: true, message: '姓名必填' },
        email: { required: true, message: '邮箱必填' },
      },
    });
    context.addField(makeFailingField('name', '姓名必填'));
    context.addField(makeFormItemContext({ prop: 'email' }));

    await context.validate().catch(() => {});

    const events = wrapper.emitted('validate');
    expect(events).toBeDefined();
    expect(events).toHaveLength(2);
    expect(events![0]).toEqual(['name', false, '姓名必填']);
    expect(events![1]).toEqual(['email', true, '']);
  });

  it('scrollToField: 滚动到目标字段，元素不存在时安全 no-op', () => {
    const { context } = mountWithCapture();

    const el = document.createElement('div');
    el.setAttribute('data-prop', 'name');
    const scrollIntoViewMock = vi.fn();
    el.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(el);

    expect(() => context.scrollToField('name')).not.toThrow();
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

    expect(() => context.scrollToField('missing')).not.toThrow();

    document.body.removeChild(el);
  });

  it('validate: scrollToError=true 时校验失败滚动到第一个错误字段', async () => {
    const { context } = mountWithCapture({
      model: { name: '' },
      rules: { name: { required: true, message: '姓名必填' } },
      scrollToError: true,
    });
    context.addField(makeFailingField('name', '姓名必填'));

    const el = document.createElement('div');
    el.setAttribute('data-prop', 'name');
    const scrollIntoViewMock = vi.fn();
    el.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(el);

    await context.validate().catch(() => {});

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

    document.body.removeChild(el);
  });
});
