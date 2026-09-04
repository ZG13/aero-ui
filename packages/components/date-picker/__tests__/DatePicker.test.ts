import { describe, expect, it, vi, afterEach } from 'vitest';
import { defineComponent, h, nextTick, provide } from 'vue';
import type { PropType } from 'vue';
import { mount, enableAutoUnmount, type VueWrapper } from '@vue/test-utils';
import dayjs from 'dayjs';
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

async function openPanel(wrapper: VueWrapper) {
  await wrapper.find('.aero-date-picker__trigger').trigger('click');
  await nextTick();
}

function panelCells(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll('.aero-date-table__cell'));
}

function panelEl(): HTMLElement | null {
  return document.body.querySelector('.aero-date-picker__panel');
}

function cellByText(text: string): HTMLElement | undefined {
  return panelCells().find((el) => el.textContent?.trim() === text);
}

describe('AeroDatePicker 触发器', () => {
  it('受控值同步到输入框并按 format 回显', () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    expect(innerValue(wrapper)).toBe('2024-01-15');
  });

  it('空值展示空输入框与默认占位', () => {
    const wrapper = mountPicker({});
    expect(innerValue(wrapper)).toBe('');
    expect(inner(wrapper).attributes('placeholder')).toBe('请选择日期');
  });

  it('点击触发器展开面板并派发 visible-change，选中后收起', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await openPanel(wrapper);
    expect(panelEl()).not.toBeNull();
    expect(wrapper.emitted('visible-change')?.at(-1)).toEqual([true]);

    const target = cellByText('15');
    await target?.click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(panelEl()).toBeNull();
    expect(wrapper.emitted('visible-change')?.at(-1)).toEqual([false]);
  });

  it('value-format 控制派发字符串', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15', valueFormat: 'YYYY/MM/DD' });
    await openPanel(wrapper);
    await cellByText('20')?.click();
    const value = wrapper.emitted('update:modelValue')!.at(-1)![0];
    expect(value).toMatch(/^2024\/01\/20$/);
  });

  it('未设置 value-format 派发 Date 对象', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await openPanel(wrapper);
    await cellByText('20')?.click();
    const value = wrapper.emitted('update:modelValue')!.at(-1)![0];
    expect(value).toBeInstanceOf(Date);
  });

  it('disabled 时不可展开面板且输入框禁用', async () => {
    const wrapper = mountPicker({ disabled: true });
    await openPanel(wrapper);
    expect(panelEl()).toBeNull();
    expect(inner(wrapper).attributes('disabled')).toBeDefined();
  });

  it('editable=false 时输入框只读', () => {
    const wrapper = mountPicker({ editable: false });
    expect(inner(wrapper).attributes('readonly')).toBeDefined();
  });

  it('readonly 时输入框只读但面板可开', async () => {
    const wrapper = mountPicker({ readonly: true, modelValue: '2024-01-15' });
    expect(inner(wrapper).attributes('readonly')).toBeDefined();
    await openPanel(wrapper);
    expect(panelEl()).not.toBeNull();
  });

  it('hover 触发器后显示清除按钮，清空派发 null 与 clear', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15', clearable: true });
    await wrapper.find('.aero-date-picker').trigger('mouseenter');
    await nextTick();
    expect(wrapper.find('.aero-date-picker__clear').exists()).toBe(true);
    await wrapper.find('.aero-date-picker__clear').trigger('click');
    expect(wrapper.emitted('clear')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null]);
  });

  it('Escape 关闭面板', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await openPanel(wrapper);
    expect(panelEl()).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(panelEl()).toBeNull();
  });

  it('导出对象带 install 方法', () => {
    expect(typeof AeroDatePicker.install).toBe('function');
  });
});

describe('AeroDatePicker 手动输入（editable）', () => {
  it('Enter 提交有效输入并派发', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15', valueFormat: 'YYYY-MM-DD' });
    await inner(wrapper).setValue('2024-02-10');
    await inner(wrapper).trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['2024-02-10']);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('无效输入失焦后恢复回显且不派发', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await inner(wrapper).setValue('not-a-date');
    await inner(wrapper).trigger('blur');
    await nextTick();
    expect(innerValue(wrapper)).toBe('2024-01-15');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('与当前值相同的输入不重复派发', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15', valueFormat: 'YYYY-MM-DD' });
    await inner(wrapper).setValue('2024-01-15');
    await inner(wrapper).trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});

describe('AeroDatePicker 单面板（date）', () => {
  it('« » 切换年份，< > 切换月份，panel-change 派发', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await openPanel(wrapper);

    const navs = () => Array.from(document.body.querySelectorAll<HTMLElement>('.aero-date-panel__nav'));
    // 顺序：« < title > »（DatePanel 中前两个是年/月后退）
    await navs()[0].click(); // « 上一年
    await nextTick();
    await navs()[3].click(); // » 下一年
    await nextTick();
    expect(document.body.querySelector('.aero-date-panel__title')?.textContent).toContain('2024');

    await navs()[1].click(); // < 上月
    await nextTick();
    expect(wrapper.emitted('panel-change')).toBeTruthy();
  });

  it('点击标题切到月视图选择月份后返回日视图', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await openPanel(wrapper);

    const labels = document.body.querySelectorAll<HTMLElement>('.aero-date-panel__title-label');
    await labels[1].click(); // 月份 label → 月视图
    await nextTick();
    expect(document.body.querySelector('.aero-month-table')).not.toBeNull();

    const monthCell = Array.from(
      document.body.querySelectorAll<HTMLElement>('.aero-month-table__cell'),
    ).at(-1); // 12 月
    await monthCell?.click();
    await nextTick();
    expect(document.body.querySelector('.aero-date-table')).not.toBeNull();
    expect(document.body.querySelector('.aero-date-panel__title')?.textContent).toContain('12');
  });

  it('点击年份 label 切到年视图选择年份', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await openPanel(wrapper);

    const labels = document.body.querySelectorAll<HTMLElement>('.aero-date-panel__title-label');
    await labels[0].click(); // 年份 label → 年视图
    await nextTick();
    expect(document.body.querySelector('.aero-year-table')).not.toBeNull();

    const yearCell = Array.from(
      document.body.querySelectorAll<HTMLElement>('.aero-year-table__cell'),
    ).find((el) => el.textContent?.trim() === '2025');
    await yearCell?.click();
    await nextTick();
    // 选年后进入月视图
    expect(document.body.querySelector('.aero-month-table')).not.toBeNull();
  });

  it('前后月补位日期可选并跳转该月', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15', valueFormat: 'YYYY-MM-DD' });
    await openPanel(wrapper);

    const otherMonth = panelCells().find(
      (el) => el.classList.contains('is-other-month') && el.textContent?.trim() === '1',
    );
    await otherMonth?.click();
    const value = wrapper.emitted('update:modelValue')!.at(-1)![0];
    // 2024-01 网格中补位 1 号为 2024-02-01
    expect(value).toBe('2024-02-01');
  });

  it('footer「今天」按钮选中今天', async () => {
    const wrapper = mountPicker({ valueFormat: 'YYYY-MM-DD' });
    await openPanel(wrapper);
    const btn = document.body.querySelector('.aero-date-panel__footer-btn') as HTMLButtonElement;
    await btn.click();
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([dayjs().format('YYYY-MM-DD')]);
  });

  it('shortcuts 快捷项点击派发', async () => {
    const wrapper = mountPicker({
      modelValue: '2024-01-15',
      valueFormat: 'YYYY-MM-DD',
      shortcuts: [{ text: '昨天', value: () => new Date(2024, 0, 14) }],
    });
    await openPanel(wrapper);
    const btn = document.body.querySelector('.aero-date-panel__shortcut') as HTMLButtonElement;
    await btn.click();
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['2024-01-14']);
  });

  it('first-day-of-week 控制周标题排列', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15', firstDayOfWeek: 1 });
    await openPanel(wrapper);
    const weekdays = Array.from(
      document.body.querySelectorAll('.aero-date-table__weekday'),
    ).map((el) => el.textContent?.trim());
    expect(weekdays).toEqual(['一', '二', '三', '四', '五', '六', '日']);
  });
});

describe('AeroDatePicker 键盘导航（date）', () => {
  it('方向键移动键盘焦点并翻页', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15' });
    await openPanel(wrapper);

    await inner(wrapper).trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    const focused = panelCells().find((el) => el.classList.contains('is-focused'));
    expect(focused?.textContent?.trim()).toBe('16');
  });

  it('Enter 选中键盘焦点日期', async () => {
    const wrapper = mountPicker({ modelValue: '2024-01-15', valueFormat: 'YYYY-MM-DD' });
    await openPanel(wrapper);

    await inner(wrapper).trigger('keydown', { key: 'ArrowRight' });
    await inner(wrapper).trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['2024-01-16']);
  });
});

describe('AeroDatePicker 范围（daterange）', () => {
  it('双输入回显与分隔符', () => {
    const wrapper = mountPicker({
      type: 'daterange',
      modelValue: ['2024-01-01', '2024-01-31'],
    });
    const inputs = wrapper.findAll('.aero-date-picker__inner');
    expect(inputs).toHaveLength(2);
    expect((inputs[0].element as HTMLInputElement).value).toBe('2024-01-01');
    expect((inputs[1].element as HTMLInputElement).value).toBe('2024-01-31');
    expect(wrapper.find('.aero-date-picker__separator').text()).toBe('-');
  });

  it('两段式选择派发范围与 calendar-change', async () => {
    const wrapper = mountPicker({ type: 'daterange', valueFormat: 'YYYY-MM-DD' });
    await openPanel(wrapper);

    const cells = panelCells().filter((el) => !el.classList.contains('is-other-month'));
    await cells[0].click(); // 选 start
    await nextTick();
    expect(wrapper.emitted('calendar-change')).toBeTruthy();

    await cells[5].click(); // 选 end
    const value = wrapper.emitted('update:modelValue')!.at(-1)![0];
    expect(Array.isArray(value)).toBe(true);
  });

  it('完成选择后再次点击重新开始', async () => {
    const wrapper = mountPicker({
      type: 'daterange',
      modelValue: ['2024-01-05', '2024-01-10'],
      valueFormat: 'YYYY-MM-DD',
    });
    await openPanel(wrapper);

    const cells = panelCells().filter(
      (el) => !el.classList.contains('is-other-month') && el.textContent?.trim() === '20',
    );
    // 第一次点击定 start（20 号），只派发 calendar-change
    await cells[0].click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();

    // 第二次点击早于 start → 重设 start，仍不派发
    const early = panelCells().find(
      (el) => !el.classList.contains('is-other-month') && el.textContent?.trim() === '8',
    );
    await early?.click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('hover 预览范围高亮', async () => {
    const wrapper = mountPicker({ type: 'daterange', modelValue: null });
    await openPanel(wrapper);

    const cells = panelCells().filter((el) => !el.classList.contains('is-other-month'));
    await cells[0].click(); // 定 start
    // hover 第 6 格 → 1..6 带范围背景（含端点，element-plus 一致）
    const target = cells[5];
    target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await nextTick();
    const inRange = panelCells().filter((el) => el.classList.contains('is-in-range'));
    expect(inRange.length).toBe(6);
  });

  it('unlink-panels=false 右面板导航联动整体平移', async () => {
    const wrapper = mountPicker({ type: 'daterange', modelValue: ['2024-01-01', '2024-01-31'] });
    await openPanel(wrapper);

    const titles = () =>
      Array.from(document.body.querySelectorAll('.aero-date-panel__title-label')).map((el) =>
        el.textContent?.trim(),
      );
    expect(titles()).toEqual(['2024-01', '2024-02']);

    // 右面板 > 按钮：整体平移
    const calendars = document.body.querySelectorAll('.aero-date-panel__calendar');
    const rightNavs = calendars[1].querySelectorAll('button.aero-date-panel__nav');
    await (rightNavs[0] as HTMLElement).click();
    await nextTick();
    expect(titles()).toEqual(['2024-02', '2024-03']);
  });

  it('unlink-panels=true 左右面板独立导航', async () => {
    const wrapper = mountPicker({
      type: 'daterange',
      modelValue: ['2024-01-01', '2024-01-31'],
      unlinkPanels: true,
    });
    await openPanel(wrapper);

    const calendars = document.body.querySelectorAll('.aero-date-panel__calendar');
    const rightNavs = calendars[1].querySelectorAll('button.aero-date-panel__nav');
    await (rightNavs[0] as HTMLElement).click(); // 右面板 >
    await nextTick();
    const titles = Array.from(
      document.body.querySelectorAll('.aero-date-panel__title-label'),
    ).map((el) => el.textContent?.trim());
    expect(titles).toEqual(['2024-01', '2024-03']);
  });

  it('范围快捷项派发范围值', async () => {
    const wrapper = mountPicker({
      type: 'daterange',
      valueFormat: 'YYYY-MM-DD',
      shortcuts: [
        { text: '本周', value: () => [new Date(2024, 0, 1), new Date(2024, 0, 7)] },
      ],
    });
    await openPanel(wrapper);
    const btn = document.body.querySelector('.aero-date-panel__shortcut') as HTMLButtonElement;
    await btn.click();
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([
      ['2024-01-01', '2024-01-07'],
    ]);
  });

  it('清空范围派发 null', async () => {
    const wrapper = mountPicker({
      type: 'daterange',
      modelValue: ['2024-01-01', '2024-01-31'],
      clearable: true,
    });
    await wrapper.find('.aero-date-picker').trigger('mouseenter');
    await nextTick();
    await wrapper.find('.aero-date-picker__clear').trigger('click');
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null]);
  });
});

describe('AeroDatePicker disabled-date 与 cell-class-name', () => {
  it('disabled-date 禁用日期不可选', async () => {
    const wrapper = mountPicker({
      modelValue: '2024-01-15',
      disabledDate: (d: Date) => d.getDate() === 15,
    });
    await openPanel(wrapper);
    const disabled = cellByText('15');
    expect(disabled?.classList).toContain('is-disabled');
    await disabled?.click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('cell-class-name 附加自定义类', async () => {
    const wrapper = mountPicker({
      modelValue: '2024-01-15',
      cellClassName: (d: Date) => (d.getDate() === 20 ? 'my-cell' : ''),
    });
    await openPanel(wrapper);
    expect(cellByText('20')?.classList).toContain('my-cell');
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

  it('blur 触发字段即时校验', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const wrapper = mountInContext({
      props: { modelValue: '2024-01-15' },
      formItem: makeFormItemContext({ validate }),
    });
    await inner(wrapper).trigger('blur');
    expect(validate).toHaveBeenCalledWith('blur');
  });

  it('validate-event=false 时不触发校验', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const wrapper = mountInContext({
      props: { modelValue: '2024-01-15', validateEvent: false },
      formItem: makeFormItemContext({ validate }),
    });
    await inner(wrapper).trigger('blur');
    expect(validate).not.toHaveBeenCalled();
  });

  it('选中日期后触发 change 校验', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const wrapper = mountInContext({
      props: { modelValue: '2024-01-15' },
      formItem: makeFormItemContext({ validate }),
    });
    await openPanel(wrapper);
    await cellByText('20')?.click();
    expect(validate).toHaveBeenCalledWith('change');
  });
});
