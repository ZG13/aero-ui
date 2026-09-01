import { describe, expect, it, vi, afterEach } from 'vitest';
import { defineComponent, h, provide } from 'vue';
import type { PropType } from 'vue';
import { mount, enableAutoUnmount, type VueWrapper } from '@vue/test-utils';
import AeroDatePicker from '../index';
import { formContextKey, formItemContextKey } from '../../form/src/constants';
import type { FormContext, FormItemContext } from '../../form/src/constants';

enableAutoUnmount(afterEach);

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(AeroDatePicker, { props });
}

function inner(wrapper: VueWrapper) {
  return wrapper.find('.aero-date-picker__inner');
}

function innerValue(wrapper: VueWrapper): string {
  return (inner(wrapper).element as HTMLInputElement).value;
}

function panelCells(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll('.aero-date-table__cell'));
}

describe('AeroDatePicker', () => {
  it('受控值同步到输入框并按 format 回显', () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    expect(innerValue(wrapper)).toBe('2024-01-15');
  });

  it('空值展示空输入框', () => {
    const wrapper = mountPicker({});
    expect(innerValue(wrapper)).toBe('');
  });

  it('点击触发器展开面板，选中日期后收起并派发事件', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await wrapper.find('.aero-date-picker__trigger').trigger('click');
    expect(document.body.querySelector('.aero-date-picker__panel')).not.toBeNull();

    // 点击当月 15 号（从面板找非 disabled 的当天单元格）
    const target = panelCells().find((el) => el.textContent?.trim() === '15');
    await target?.click();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(document.body.querySelector('.aero-date-picker__panel')).toBeNull();
  });

  it('value-format 控制派发字符串', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15', valueFormat: 'YYYY/MM/DD' });
    await wrapper.find('.aero-date-picker__trigger').trigger('click');
    const target = panelCells().find((el) => el.textContent?.trim() === '20');
    await target?.click();
    const value = wrapper.emitted('update:modelValue')!.at(-1)![0];
    expect(value).toMatch(/^2024\/01\/20$/);
  });

  it('未设置 value-format 派发 Date 对象', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await wrapper.find('.aero-date-picker__trigger').trigger('click');
    const target = panelCells().find((el) => el.textContent?.trim() === '20');
    await target?.click();
    const value = wrapper.emitted('update:modelValue')!.at(-1)![0];
    expect(value).toBeInstanceOf(Date);
  });

  it('daterange 两段式选择派发范围', async () => {
    const wrapper = mountPicker({ type: 'daterange' });
    await wrapper.find('.aero-date-picker__trigger').trigger('click');
    const cells = panelCells().filter((el) => !el.classList.contains('is-other-month'));
    await cells[0].click();
    await cells[5].click();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const value = wrapper.emitted('update:modelValue')!.at(-1)![0];
    expect(Array.isArray(value)).toBe(true);
  });

  it('disabled 时不可展开面板', async () => {
    const wrapper = mountPicker({ disabled: true });
    await wrapper.find('.aero-date-picker__trigger').trigger('click');
    expect(document.body.querySelector('.aero-date-picker__panel')).toBeNull();
  });

  it('disabled-date 禁用日期不可选', async () => {
    const wrapper = mountPicker({
      modelValue: '2024-01-15',
      disabledDate: (d: Date) => d.getDate() === 15,
    });
    await wrapper.find('.aero-date-picker__trigger').trigger('click');
    const disabled = panelCells().find((el) => el.textContent?.trim() === '15');
    expect(disabled?.classList).toContain('is-disabled');
  });

  it('clearable 清空并派发 clear', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15', clearable: true });
    await wrapper.find('.aero-date-picker__clear').trigger('click');
    expect(wrapper.emitted('clear')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([undefined]);
  });

  it('editable=false 时输入框只读', () => {
    const wrapper = mountPicker({ editable: false });
    expect(inner(wrapper).attributes('readonly')).toBeDefined();
  });

  it('导出对象带 install 方法', () => {
    expect(typeof AeroDatePicker.install).toBe('function');
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
    prop: 'date',
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
    slots: { default: () => h(AeroDatePicker, options.props ?? {}) },
  });
}

describe('AeroDatePicker 表单上下文集成', () => {
  it('继承表单级 size', () => {
    const wrapper = mountInContext({ form: makeFormContext({ size: 'large' }) });
    expect(wrapper.find('.aero-date-picker').classes()).toContain('aero-date-picker--large');
  });

  it('自身 size 覆盖表单级 size', () => {
    const wrapper = mountInContext({
      props: { size: 'small' },
      form: makeFormContext({ size: 'large' }),
    });
    expect(wrapper.find('.aero-date-picker').classes()).toContain('aero-date-picker--small');
  });

  it('继承表单级 disabled', () => {
    const wrapper = mountInContext({ form: makeFormContext({ disabled: true }) });
    expect(inner(wrapper).attributes('disabled')).toBeDefined();
  });

  it('blur/change 触发字段即时校验', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const wrapper = mountInContext({
      props: { modelValue: '2024-01-15' },
      formItem: makeFormItemContext({ validate }),
    });
    await inner(wrapper).trigger('blur');
    expect(validate).toHaveBeenCalledWith('blur');
  });
});
