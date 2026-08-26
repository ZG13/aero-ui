import { describe, expect, it } from 'vitest';
import { defineComponent, h, provide } from 'vue';
import type { PropType } from 'vue';
import { mount } from '@vue/test-utils';
import { formContextKey, formItemContextKey } from '../src/constants';
import type { FormContext, FormItemContext } from '../src/constants';
import { useFormSize, useFormDisabled } from '../src/use-form';
import type { FormSize } from '../types';

/** 探测组件：消费 useFormSize/useFormDisabled，将解析结果渲染为文本供断言。 */
const Probe = defineComponent({
  props: {
    initialSize: { type: String as PropType<FormSize> },
    initialDisabled: { type: Boolean as PropType<boolean> },
  },
  setup(props) {
    const size = useFormSize(props.initialSize);
    const disabled = useFormDisabled(props.initialDisabled);
    return () =>
      h('div', [
        h('span', { class: 'probe-size' }, size.value ?? 'undefined'),
        h('span', { class: 'probe-disabled' }, String(disabled.value)),
      ]);
  },
});

/** 宿主组件：按需 provide formContext / formItemContext，再渲染 Probe 插槽。 */
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

interface MountOptions {
  initialSize?: FormSize;
  initialDisabled?: boolean;
  form?: FormContext;
  formItem?: FormItemContext;
}

function mountProbe(options: MountOptions = {}) {
  return mount(Provider, {
    props: { form: options.form, formItem: options.formItem },
    slots: {
      default: () =>
        h(Probe, {
          initialSize: options.initialSize,
          initialDisabled: options.initialDisabled,
        }),
    },
  });
}

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

describe('useFormSize / useFormDisabled', () => {
  describe('无上下文', () => {
    it('size 返回 undefined，disabled 返回 false（默认值）', () => {
      const wrapper = mountProbe();
      expect(wrapper.find('.probe-size').text()).toBe('undefined');
      expect(wrapper.find('.probe-disabled').text()).toBe('false');
    });

    it('自身初始值生效', () => {
      const wrapper = mountProbe({ initialSize: 'large', initialDisabled: true });
      expect(wrapper.find('.probe-size').text()).toBe('large');
      expect(wrapper.find('.probe-disabled').text()).toBe('true');
    });
  });

  describe('仅表单上下文', () => {
    it('继承表单级 size/disabled', () => {
      const wrapper = mountProbe({
        form: makeFormContext({ size: 'small', disabled: true }),
      });
      expect(wrapper.find('.probe-size').text()).toBe('small');
      expect(wrapper.find('.probe-disabled').text()).toBe('true');
    });

    it('表单级未声明时回退默认值', () => {
      const wrapper = mountProbe({ form: makeFormContext() });
      expect(wrapper.find('.probe-size').text()).toBe('undefined');
      expect(wrapper.find('.probe-disabled').text()).toBe('false');
    });
  });

  describe('表单 + 表单项上下文', () => {
    it('表单项级优先于表单级', () => {
      const wrapper = mountProbe({
        form: makeFormContext({ size: 'small', disabled: true }),
        formItem: makeFormItemContext({ size: 'large', disabled: false }),
      });
      expect(wrapper.find('.probe-size').text()).toBe('large');
      expect(wrapper.find('.probe-disabled').text()).toBe('false');
    });

    it('size 与 disabled 独立继承（表单级仅声明 disabled 时，size 回退默认）', () => {
      const wrapper = mountProbe({
        form: makeFormContext({ disabled: true }),
      });
      expect(wrapper.find('.probe-size').text()).toBe('undefined');
      expect(wrapper.find('.probe-disabled').text()).toBe('true');
    });
  });

  describe('自身初始值最高优先', () => {
    it('自身 size/disabled 覆盖表单与表单项', () => {
      const wrapper = mountProbe({
        initialSize: 'main',
        initialDisabled: true,
        form: makeFormContext({ size: 'small', disabled: false }),
        formItem: makeFormItemContext({ size: 'large', disabled: false }),
      });
      expect(wrapper.find('.probe-size').text()).toBe('main');
      expect(wrapper.find('.probe-disabled').text()).toBe('true');
    });
  });

  describe('优先级链：自身 → formItem → form → 默认', () => {
    it('链式解析符合预期', () => {
      // 自身缺省 → 继承 formItem → 继承 form → 默认
      const viaFormItem = mountProbe({
        form: makeFormContext({ size: 'small', disabled: true }),
        formItem: makeFormItemContext({ size: 'main', disabled: true }),
      });
      expect(viaFormItem.find('.probe-size').text()).toBe('main');
      expect(viaFormItem.find('.probe-disabled').text()).toBe('true');

      const viaForm = mountProbe({
        form: makeFormContext({ size: 'small', disabled: true }),
      });
      expect(viaForm.find('.probe-size').text()).toBe('small');
      expect(viaForm.find('.probe-disabled').text()).toBe('true');

      const viaDefault = mountProbe();
      expect(viaDefault.find('.probe-size').text()).toBe('undefined');
      expect(viaDefault.find('.probe-disabled').text()).toBe('false');
    });
  });
});
