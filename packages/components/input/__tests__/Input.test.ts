import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, provide } from 'vue';
import type { PropType } from 'vue';
import { mount } from '@vue/test-utils';
import AeroInput from '../index';
import { formContextKey, formItemContextKey } from '../../form/src/constants';
import type { FormContext, FormItemContext } from '../../form/src/constants';

describe('AeroInput', () => {
  it('受控值同步到原生 input', () => {
    const wrapper = mount(AeroInput, { props: { modelValue: 'hello' } });
    expect(wrapper.find('input').element.value).toBe('hello');
  });

  it('输入派发 update:modelValue 与 input', async () => {
    const wrapper = mount(AeroInput, { props: { modelValue: '' } });
    await wrapper.find('input').setValue('abc');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['abc']);
  });

  it('失焦派发 change', async () => {
    const wrapper = mount(AeroInput, { props: { modelValue: 'x' } });
    await wrapper.find('input').trigger('blur');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('disabled 时 input 原生 disabled', () => {
    const wrapper = mount(AeroInput, { props: { modelValue: '', disabled: true } });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });

  it('clearable 有值时展示清空入口，点击派发 clear 并清空', async () => {
    const wrapper = mount(AeroInput, { props: { modelValue: 'abc', clearable: true } });
    const clear = wrapper.find('.aero-input__clear');
    expect(clear.exists()).toBe(true);
    await clear.trigger('click');
    expect(wrapper.emitted('clear')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['']);
  });

  it('无值时 clearable 不展示清空入口', () => {
    const wrapper = mount(AeroInput, { props: { modelValue: '', clearable: true } });
    expect(wrapper.find('.aero-input__clear').exists()).toBe(false);
  });

  it('默认启用浮动占位，展示 label 且原生 placeholder 为空', () => {
    const wrapper = mount(AeroInput, { props: { modelValue: '', placeholder: '请输入' } });
    expect(wrapper.find('.aero-input__label').exists()).toBe(true);
    expect(wrapper.find('input').attributes('placeholder')).toBe('');
  });

  it('floating 为 false 时移除 label 并使用原生 placeholder', () => {
    const wrapper = mount(AeroInput, { props: { modelValue: '', placeholder: '请输入', floating: false } });
    expect(wrapper.find('.aero-input__label').exists()).toBe(false);
    expect(wrapper.find('input').attributes('placeholder')).toBe('请输入');
  });

  it('导出对象带 install 方法', () => {
    expect(typeof AeroInput.install).toBe('function');
  });
});

/** 构造完整 FormContext，缺省为「无 size/disabled 的默认态」。 */
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

/** 构造完整 FormItemContext。 */
function makeFormItemContext(
  overrides: Partial<FormItemContext> = {},
): FormItemContext {
  return {
    prop: 'name',
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

/** 宿主组件：按需 provide formContext / formItemContext，再渲染插槽中的 Input。 */
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

function mountInput(options: {
  props?: Record<string, unknown>;
  form?: FormContext;
  formItem?: FormItemContext;
} = {}) {
  return mount(Provider, {
    props: { form: options.form, formItem: options.formItem },
    slots: { default: () => h(AeroInput, options.props ?? {}) },
  });
}

describe('AeroInput 表单上下文集成', () => {
  describe('size 继承（requirement 5.4）', () => {
    it('继承表单级 size', () => {
      const wrapper = mountInput({
        form: makeFormContext({ size: 'large' }),
      });
      expect(wrapper.find('.aero-input').classes()).toContain('aero-input--large');
    });

    it('无上下文时默认 main（向后兼容）', () => {
      const wrapper = mount(AeroInput);
      expect(wrapper.find('.aero-input').classes()).toContain('aero-input--main');
    });

    it('自身 size 覆盖表单级 size', () => {
      const wrapper = mountInput({
        props: { size: 'small' },
        form: makeFormContext({ size: 'large' }),
      });
      expect(wrapper.find('.aero-input').classes()).toContain('aero-input--small');
      expect(wrapper.find('.aero-input').classes()).not.toContain('aero-input--large');
    });
  });

  describe('disabled 继承（requirement 5.4）', () => {
    it('继承表单级 disabled', () => {
      const wrapper = mountInput({
        form: makeFormContext({ disabled: true }),
      });
      expect(wrapper.find('.aero-input').classes()).toContain('is-disabled');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('自身 disabled=false 覆盖表单级 disabled=true', () => {
      const wrapper = mountInput({
        props: { disabled: false },
        form: makeFormContext({ disabled: true }),
      });
      expect(wrapper.find('.aero-input').classes()).not.toContain('is-disabled');
      expect(wrapper.find('input').attributes('disabled')).toBeUndefined();
    });

    it('自身 disabled=true 覆盖表单级 disabled=false', () => {
      const wrapper = mountInput({
        props: { disabled: true },
        form: makeFormContext({ disabled: false }),
      });
      expect(wrapper.find('.aero-input').classes()).toContain('is-disabled');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });
  });

  describe('触发校验（requirement 4.3）', () => {
    it('在 formItem 内 blur 触发 validate("blur")、change 触发 validate("change")', async () => {
      const validate = vi.fn(() => Promise.resolve([]));
      const wrapper = mountInput({
        props: { modelValue: 'x' },
        formItem: makeFormItemContext({ validate }),
      });
      await wrapper.find('input').trigger('blur');
      expect(validate).toHaveBeenCalledWith('blur');
      expect(validate).toHaveBeenCalledWith('change');
    });

    it('无 formItem 上下文时不触发校验', async () => {
      const wrapper = mount(AeroInput, { props: { modelValue: 'x' } });
      await wrapper.find('input').trigger('blur');
      // 无 formItem 上下文，不抛错，change 事件照常派发
      expect(wrapper.emitted('change')).toBeTruthy();
    });
  });
});
