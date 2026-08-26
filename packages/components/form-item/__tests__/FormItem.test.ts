import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, inject, nextTick, provide } from 'vue';
import type { PropType } from 'vue';
import { mount } from '@vue/test-utils';
import FormItem from '../src/FormItem.vue';
import AeroForm from '../../form/src/Form.vue';
import { formContextKey, formItemContextKey } from '../../form/src/constants';
import type { FormContext, FormItemContext } from '../../form/src/constants';

type ProvidedFormContext = FormContext & { fields: FormItemContext[] };

/** 构造完整 FormContext，缺省为「无 size/disabled 的默认态」。 */
function makeFormContext(overrides: Partial<ProvidedFormContext> = {}): ProvidedFormContext {
  const fields: FormItemContext[] = [];
  const context: ProvidedFormContext = {
    model: {},
    rules: {},
    size: undefined,
    disabled: false,
    labelWidth: 'auto',
    labelPosition: 'right',
    inline: false,
    showMessage: true,
    statusIcon: false,
    addField: (field) => {
      fields.push(field);
    },
    removeField: (field) => {
      const index = fields.indexOf(field);
      if (index !== -1) fields.splice(index, 1);
    },
    validate: () => Promise.resolve(true),
    validateField: () => Promise.resolve(true),
    resetFields: () => {},
    clearValidate: () => {},
    scrollToField: () => {},
    fields,
    ...overrides,
  };
  return context;
}

/**
 * 宿主：provide formContextKey，并渲染 FormItem（含 label/error 插槽），可选捕获
 * formItemContextKey。默认插槽渲染 'content'。
 */
function makeProvider(capture?: (ctx: FormItemContext | undefined) => void) {
  return defineComponent({
    props: {
      form: { type: Object as PropType<ProvidedFormContext>, required: true },
      itemProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
      labelSlot: { type: Function as PropType<() => unknown> },
      errorSlot: { type: Function as PropType<(scope: { error: string }) => unknown> },
    },
    setup(props, { slots }) {
      provide(formContextKey, props.form as FormContext);
      const Capture = capture
        ? defineComponent({
            setup() {
              capture(inject(formItemContextKey));
              return () => h('span');
            },
          })
        : null;

      return () =>
        h(
          FormItem,
          props.itemProps,
          {
            default: Capture
              ? () => h(Capture)
              : () => (slots.default ? slots.default() : 'content'),
            label: props.labelSlot,
            error: props.errorSlot,
          },
        );
    },
  });
}

function mountFormItem(options: {
  props?: Record<string, unknown>;
  form?: ProvidedFormContext;
  slots?: { default?: () => unknown; label?: () => unknown; error?: (scope: { error: string }) => unknown };
} = {}) {
  const form = options.form ?? makeFormContext();
  const Provider = makeProvider();
  const wrapper = mount(Provider, {
    props: {
      form,
      itemProps: options.props ?? {},
      labelSlot: options.slots?.label,
      errorSlot: options.slots?.error,
    },
    slots: options.slots?.default ? { default: options.slots.default } : undefined,
  });
  return { wrapper, form };
}

function mountFormItemWithCapture(options: {
  props?: Record<string, unknown>;
  form?: ProvidedFormContext;
} = {}) {
  let captured: FormItemContext | undefined;
  const form = options.form ?? makeFormContext();
  const Provider = makeProvider((ctx) => {
    captured = ctx;
  });
  const wrapper = mount(Provider, {
    props: { form, itemProps: options.props ?? {} },
  });
  return { wrapper, form, getCaptured: () => captured };
}

describe('AeroFormItem', () => {
  it('渲染 aero-form-item 根元素', () => {
    const { wrapper } = mountFormItem({ props: { prop: 'name' } });
    expect(wrapper.find('.aero-form-item').exists()).toBe(true);
  });

  it('渲染 label 与必填星号（required=true）', () => {
    const { wrapper } = mountFormItem({
      props: { prop: 'name', label: '姓名', required: true },
    });
    expect(wrapper.find('.aero-form-item__label').text()).toContain('姓名');
    expect(wrapper.find('.aero-form-item__required').exists()).toBe(true);
    expect(wrapper.find('.aero-form-item').classes()).toContain('is-required');
  });

  it('rules 含 required: true 时展示必填星号（3.3）', () => {
    const { wrapper } = mountFormItem({
      props: {
        prop: 'name',
        label: '姓名',
        rules: [{ required: true, message: '必填' }],
      },
    });
    expect(wrapper.find('.aero-form-item__required').exists()).toBe(true);
    expect(wrapper.find('.aero-form-item').classes()).toContain('is-required');
  });

  it('表单级 rules 含 required 时展示必填星号', () => {
    const form = makeFormContext({
      rules: { name: { required: true, message: '必填' } },
    });
    const { wrapper } = mountFormItem({
      props: { prop: 'name', label: '姓名' },
      form,
    });
    expect(wrapper.find('.aero-form-item__required').exists()).toBe(true);
  });

  it('挂载时注册字段到表单，卸载时注销', async () => {
    const form = makeFormContext();
    const { wrapper } = mountFormItem({ props: { prop: 'name' }, form });
    await nextTick();
    expect(form.fields).toHaveLength(1);
    expect(form.fields[0].prop).toBe('name');

    wrapper.unmount();
    expect(form.fields).toHaveLength(0);
  });

  it('无 prop 时不注册字段', async () => {
    const form = makeFormContext();
    const { wrapper } = mountFormItem({ props: { label: '纯展示' }, form });
    await nextTick();
    expect(form.fields).toHaveLength(0);
    expect(wrapper.find('.aero-form-item').exists()).toBe(true);
  });

  it('无 formContext 时不抛错（向后兼容）', () => {
    const wrapper = mount(FormItem, {
      props: { prop: 'name', label: '姓名' },
      slots: { default: () => 'content' },
    });
    expect(wrapper.find('.aero-form-item').exists()).toBe(true);
    expect(wrapper.find('.aero-form-item__label').text()).toContain('姓名');
  });

  it('provide formItemContext：prop/validateState/validateMessage 可注入', () => {
    const { getCaptured } = mountFormItemWithCapture({ props: { prop: 'name' } });
    const captured = getCaptured();
    expect(captured).toBeDefined();
    expect(captured!.prop).toBe('name');
    expect(captured!.validateState).toBe('');
    expect(captured!.validateMessage).toBe('');
  });

  it('disabled 折叠表单级：表单 disabled=true 时 item 未声明 → true（2.2 契约）', () => {
    const form = makeFormContext({ disabled: true });
    const { getCaptured } = mountFormItemWithCapture({
      props: { prop: 'name' },
      form,
    });
    expect(getCaptured()!.disabled).toBe(true);
  });

  it('disabled 折叠：item 声明 false 覆盖表单级 true', () => {
    const form = makeFormContext({ disabled: true });
    const { getCaptured } = mountFormItemWithCapture({
      props: { prop: 'name', disabled: false },
      form,
    });
    expect(getCaptured()!.disabled).toBe(false);
  });

  it('size 继承：item 未声明时继承表单级 size', () => {
    const form = makeFormContext({ size: 'small' });
    const { getCaptured } = mountFormItemWithCapture({
      props: { prop: 'name' },
      form,
    });
    expect(getCaptured()!.size).toBe('small');
  });

  describe('标签宽度 labelWidth（2.3）', () => {
    it('数值 labelWidth 归一化为 px', () => {
      const { wrapper } = mountFormItem({
        props: { prop: 'name', label: '姓名', labelWidth: 100 },
      });
      const label = wrapper.find('.aero-form-item__label');
      expect(label.attributes('style')).toContain('width: 100px');
    });

    it('字符串 labelWidth 透传', () => {
      const { wrapper } = mountFormItem({
        props: { prop: 'name', label: '姓名', labelWidth: '10em' },
      });
      expect(wrapper.find('.aero-form-item__label').attributes('style')).toContain(
        'width: 10em',
      );
    });

    it('表单级 labelWidth 生效（item 未声明时）', () => {
      const form = makeFormContext({ labelWidth: 120 });
      const { wrapper } = mountFormItem({
        props: { prop: 'name', label: '姓名' },
        form,
      });
      expect(wrapper.find('.aero-form-item__label').attributes('style')).toContain(
        'width: 120px',
      );
    });

    it('item 级 labelWidth 覆盖表单级', () => {
      const form = makeFormContext({ labelWidth: 120 });
      const { wrapper } = mountFormItem({
        props: { prop: 'name', label: '姓名', labelWidth: '80px' },
        form,
      });
      expect(wrapper.find('.aero-form-item__label').attributes('style')).toContain(
        'width: 80px',
      );
    });

    it('未声明 labelWidth 时不应用宽度样式', () => {
      const form = makeFormContext({ labelWidth: undefined });
      const { wrapper } = mountFormItem({
        props: { prop: 'name', label: '姓名' },
        form,
      });
      expect(wrapper.find('.aero-form-item__label').attributes('style')).toBeUndefined();
    });
  });

  describe('字段级 validate', () => {
    it('校验失败更新 validateState=error 与 validateMessage，并 reject 错误列表', async () => {
      const form = makeFormContext({
        model: { name: '' },
        rules: { name: { required: true, message: '姓名必填' } },
      });
      const { getCaptured } = mountFormItemWithCapture({
        props: { prop: 'name' },
        form,
      });
      const item = getCaptured()!;

      await expect(item.validate(undefined)).rejects.toEqual([
        { message: '姓名必填', field: 'name' },
      ]);
      expect(item.validateState).toBe('error');
      expect(item.validateMessage).toBe('姓名必填');
    });

    it('blur/change 即时校验失败时 resolve 而非 reject，仅全量路径 reject（3.3）', async () => {
      const form = makeFormContext({
        model: { name: '' },
        rules: { name: { required: true, message: '姓名必填' } },
      });
      const { getCaptured } = mountFormItemWithCapture({
        props: { prop: 'name' },
        form,
      });
      const item = getCaptured()!;

      // blur/change 路径：更新错误状态并 resolve []，不产生未处理的 Promise 拒绝
      await expect(item.validate('blur')).resolves.toEqual([]);
      expect(item.validateState).toBe('error');
      expect(item.validateMessage).toBe('姓名必填');

      // 全量路径（trigger === undefined）：仍 reject 错误列表供表单聚合
      await expect(item.validate(undefined)).rejects.toEqual([
        { message: '姓名必填', field: 'name' },
      ]);
    });

    it('校验通过更新 validateState="" 与 validateMessage=""，resolve', async () => {
      const form = makeFormContext({
        model: { name: 'aero' },
        rules: { name: { required: true, message: '姓名必填' } },
      });
      const { getCaptured } = mountFormItemWithCapture({
        props: { prop: 'name' },
        form,
      });
      const item = getCaptured()!;

      await expect(item.validate(undefined)).resolves.toEqual([]);
      expect(item.validateState).toBe('');
      expect(item.validateMessage).toBe('');
    });

    it('表单项级 rules 覆盖表单级 rules（3.4）', async () => {
      const form = makeFormContext({
        model: { name: '' },
        rules: { name: { required: true, message: '表单必填' } },
      });
      const { getCaptured } = mountFormItemWithCapture({
        props: {
          prop: 'name',
          rules: { required: true, message: '表单项必填' },
        },
        form,
      });
      const item = getCaptured()!;

      await expect(item.validate(undefined)).rejects.toEqual([
        { message: '表单项必填', field: 'name' },
      ]);
    });

    it('表单项级 rules 在表单无 rules 时生效', async () => {
      const form = makeFormContext({ model: { age: '' } });
      const { getCaptured } = mountFormItemWithCapture({
        props: { prop: 'age', rules: { required: true, message: '年龄必填' } },
        form,
      });
      const item = getCaptured()!;

      await expect(item.validate(undefined)).rejects.toEqual([
        { message: '年龄必填', field: 'age' },
      ]);
    });

    it('无规则时校验通过且清空状态', async () => {
      const form = makeFormContext({ model: { name: 'x' } });
      const { getCaptured } = mountFormItemWithCapture({
        props: { prop: 'name' },
        form,
      });
      const item = getCaptured()!;

      await expect(item.validate(undefined)).resolves.toEqual([]);
      expect(item.validateState).toBe('');
    });

    it('无 prop 时不校验（resolve 且不更新状态）', async () => {
      const form = makeFormContext({ model: {} });
      const { getCaptured } = mountFormItemWithCapture({
        props: { rules: { required: true, message: '必填' } },
        form,
      });
      const item = getCaptured()!;

      await expect(item.validate(undefined)).resolves.toEqual([]);
      expect(item.validateState).toBe('');
    });
  });

  describe('字段级 resetField / clearValidate', () => {
    it('resetField 委托表单 resetFields 并清除校验', () => {
      const resetFields = vi.fn();
      const form = makeFormContext({ resetFields });
      const { getCaptured } = mountFormItemWithCapture({
        props: { prop: 'name' },
        form,
      });
      getCaptured()!.resetField();
      expect(resetFields).toHaveBeenCalledWith('name');
    });

    it('clearValidate 清除状态', async () => {
      const form = makeFormContext({
        model: { name: '' },
        rules: { name: { required: true, message: '姓名必填' } },
      });
      const { getCaptured } = mountFormItemWithCapture({
        props: { prop: 'name' },
        form,
      });
      const item = getCaptured()!;
      await item.validate(undefined).catch(() => {});
      expect(item.validateState).toBe('error');

      item.clearValidate();
      expect(item.validateState).toBe('');
      expect(item.validateMessage).toBe('');
    });
  });

  describe('错误展示', () => {
    it('校验失败后渲染错误消息（3.7）', async () => {
      const form = makeFormContext({
        model: { name: '' },
        rules: { name: { required: true, message: '姓名必填' } },
      });
      const { wrapper, getCaptured } = mountFormItemWithCapture({
        props: { prop: 'name', label: '姓名' },
        form,
      });
      await getCaptured()!.validate(undefined).catch(() => {});
      await nextTick();

      expect(wrapper.find('.aero-form-item').classes()).toContain('is-error');
      expect(wrapper.find('.aero-form-item__error').text()).toBe('姓名必填');
    });

    it('手动 error 覆盖校验消息', () => {
      const { wrapper } = mountFormItem({
        props: { prop: 'name', error: '手动错误' },
      });
      expect(wrapper.find('.aero-form-item').classes()).toContain('is-error');
      expect(wrapper.find('.aero-form-item__error').text()).toBe('手动错误');
    });

    it('showMessage=false 时不展示错误消息', () => {
      const { wrapper } = mountFormItem({
        props: { prop: 'name', error: '手动错误', showMessage: false },
      });
      expect(wrapper.find('.aero-form-item__error').exists()).toBe(false);
    });
  });

  describe('插槽', () => {
    it('label 插槽与 error 插槽渲染', () => {
      const { wrapper } = mountFormItem({
        props: { prop: 'name', error: 'err' },
        slots: {
          label: () => '自定义标签',
          error: ({ error }: { error: string }) => `错误：${error}`,
        },
      });
      expect(wrapper.find('.aero-form-item__label').text()).toContain('自定义标签');
      expect(wrapper.find('.aero-form-item__error').text()).toBe('错误：err');
    });
  });

  describe('status-icon', () => {
    it('statusIcon=true 且校验失败时渲染图标', async () => {
      const form = makeFormContext({
        statusIcon: true,
        model: { name: '' },
        rules: { name: { required: true, message: '姓名必填' } },
      });
      const { wrapper, getCaptured } = mountFormItemWithCapture({
        props: { prop: 'name', label: '姓名' },
        form,
      });
      await getCaptured()!.validate(undefined).catch(() => {});
      await nextTick();
      expect(wrapper.find('.aero-form-item__status-icon').exists()).toBe(true);
    });

    it('statusIcon=false 时不渲染图标', () => {
      const form = makeFormContext({
        statusIcon: false,
        model: { name: '' },
        rules: { name: { required: true, message: '姓名必填' } },
      });
      const { wrapper } = mountFormItem({
        props: { prop: 'name', error: '手动错误' },
        form,
      });
      expect(wrapper.find('.aero-form-item__status-icon').exists()).toBe(false);
    });
  });

  describe('Form↔FormItem 校验契约（3.3 架构缺口修复）', () => {
    it('AeroForm.validate 委托 FormItem.validate，字段级错误态收敛于 FormItem', async () => {
      let formCtx: FormContext | undefined;
      const Probe = defineComponent({
        setup() {
          formCtx = inject(formContextKey);
          return () => h('span');
        },
      });

      const App = defineComponent({
        setup() {
          return () =>
            h(
              AeroForm,
              { model: { name: '' }, rules: { name: { required: true, message: '姓名必填' } } },
              { default: () => [h(FormItem, { prop: 'name', label: '姓名' }), h(Probe)] },
            );
        },
      });

      const wrapper = mount(App);
      await nextTick();
      expect(formCtx).toBeDefined();

      await formCtx!.validate().catch(() => {});
      await nextTick();

      expect(wrapper.find('.aero-form-item').classes()).toContain('is-error');
      expect(wrapper.find('.aero-form-item__error').text()).toBe('姓名必填');
    });

    it('表单项级 rules 经 Form.validate 聚合生效（3.4 不再被忽略）', async () => {
      let formCtx: FormContext | undefined;
      const Probe = defineComponent({
        setup() {
          formCtx = inject(formContextKey);
          return () => h('span');
        },
      });

      const App = defineComponent({
        setup() {
          return () =>
            h(
              AeroForm,
              { model: { name: '' }, rules: {} },
              {
                default: () => [
                  h(FormItem, {
                    prop: 'name',
                    label: '姓名',
                    rules: { required: true, message: '表单项必填' },
                  }),
                  h(Probe),
                ],
              },
            );
        },
      });

      const wrapper = mount(App);
      await nextTick();

      await expect(formCtx!.validate()).rejects.toEqual({
        name: [{ message: '表单项必填', field: 'name' }],
      });
      await nextTick();

      expect(wrapper.find('.aero-form-item__error').text()).toBe('表单项必填');
    });
  });
});
