import { describe, expect, it, vi, afterEach } from 'vitest';
import { defineComponent, h, provide } from 'vue';
import type { PropType } from 'vue';
import { mount, enableAutoUnmount, type VueWrapper } from '@vue/test-utils';
import { AeroRadio, AeroRadioGroup, AeroRadioButton } from '../index';
import { formContextKey, formItemContextKey } from '../../form/src/constants';
import type { FormContext, FormItemContext } from '../../form/src/constants';

enableAutoUnmount(afterEach);

// —— 表单上下文 mock（参照 form/__tests__/use-form.test.ts 的构造方式） ——

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

/** 构造完整 FormItemContext，validate 可注入 spy。 */
function makeFormItemContext(
  overrides: Partial<FormItemContext> = {},
): FormItemContext {
  return {
    prop: 'radio',
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

// —— 宿主组件：按需 provide formContext / formItemContext，渲染 RadioGroup ——

const GroupHost = defineComponent({
  name: 'GroupHost',
  props: {
    form: { type: Object as PropType<FormContext> },
    formItem: { type: Object as PropType<FormItemContext> },
    groupProps: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
  },
  setup(props) {
    if (props.form) provide(formContextKey, props.form);
    if (props.formItem) provide(formItemContextKey, props.formItem);
    return () =>
      h(AeroRadioGroup, props.groupProps, {
        default: () => [
          h(AeroRadio, { value: 'a' }, () => '选项 A'),
          h(AeroRadio, { value: 'b' }, () => '选项 B'),
          h(AeroRadio, { value: 'c' }, () => '选项 C'),
        ],
      });
  },
});

/** 挂载 GroupHost：groupProps 透传给 RadioGroup，form/formItem 为表单上下文 mock */
function mountGroup(
  groupProps: Record<string, unknown> = {},
  form?: FormContext,
  formItem?: FormItemContext,
): VueWrapper {
  return mount(GroupHost, {
    props: { form, formItem, groupProps },
  });
}

/** 挂载带自定义子项的分组（用于按钮样式 / 子项自身配置等场景） */
function mountGroupWithChildren(
  children: () => unknown[],
  groupProps: Record<string, unknown> = {},
  form?: FormContext,
  formItem?: FormItemContext,
): VueWrapper {
  const Host = defineComponent({
    name: 'GroupHostCustom',
    props: {
      form: { type: Object as PropType<FormContext> },
      formItem: { type: Object as PropType<FormItemContext> },
      groupProps: {
        type: Object as PropType<Record<string, unknown>>,
        default: () => ({}),
      },
    },
    setup(props) {
      if (props.form) provide(formContextKey, props.form);
      if (props.formItem) provide(formItemContextKey, props.formItem);
      return () =>
        h(AeroRadioGroup, props.groupProps, { default: () => children() });
    },
  });
  return mount(Host, { props: { form, formItem, groupProps } });
}

// —— 查询辅助 ——

/** 查找组内所有原生 radio input */
function groupInputs(wrapper: VueWrapper) {
  return wrapper.findAll('input[type="radio"]');
}

/** 查找组内所有圆点单选根 label */
function groupRadios(wrapper: VueWrapper) {
  return wrapper.findAll('.aero-radio');
}

/** 点击指定序号的原生 radio */
async function clickRadio(wrapper: VueWrapper, index = 0): Promise<void> {
  await groupInputs(wrapper)[index].trigger('click');
}

/** 获取 RadioGroup 组件包装器（断言组级 emit） */
function groupComponent(wrapper: VueWrapper) {
  return wrapper.findComponent(AeroRadioGroup);
}

/** 查找圆点单选根 label 上的尺寸修饰类（aero-radio--xxx） */
function radioSizeClasses(wrapper: VueWrapper): string[] {
  return wrapper
    .find('.aero-radio')
    .classes()
    .filter((cls) => cls.startsWith('aero-radio--'));
}

describe('AeroRadioGroup 值绑定与组内互斥', () => {
  it('渲染 radiogroup 容器，绑定值仅匹配的子项选中，组内至多一个选中（2.1 / 2.2）', () => {
    const wrapper = mountGroup({ modelValue: 'b' });
    const radios = groupRadios(wrapper);
    const inputs = groupInputs(wrapper);

    expect(wrapper.find('.aero-radio-group').attributes('role')).toBe(
      'radiogroup',
    );
    // 仅 b 选中
    expect(radios[0].classes()).not.toContain('is-checked');
    expect(radios[1].classes()).toContain('is-checked');
    expect(radios[2].classes()).not.toContain('is-checked');
    // 原生受控选中同样唯一
    const checkedCount = inputs.filter(
      (input) => (input.element as HTMLInputElement).checked,
    ).length;
    expect(checkedCount).toBe(1);
    expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
  });

  it('绑定值变化时选中项随之唯一切换（2.1 / 2.2）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    let [radioA, radioB] = groupRadios(wrapper);
    expect(radioA.classes()).toContain('is-checked');
    expect(radioB.classes()).not.toContain('is-checked');

    await wrapper.setProps({ groupProps: { modelValue: 'c' } });
    [radioA, radioB] = groupRadios(wrapper);
    const radioC = groupRadios(wrapper)[2];
    expect(radioA.classes()).not.toContain('is-checked');
    expect(radioB.classes()).not.toContain('is-checked');
    expect(radioC.classes()).toContain('is-checked');
  });

  it('无绑定值时组内无任何选中项（2.1）', () => {
    const wrapper = mountGroup();
    const checked = groupInputs(wrapper).filter(
      (input) => (input.element as HTMLInputElement).checked,
    );
    expect(checked).toHaveLength(0);
    groupRadios(wrapper).forEach((radio) => {
      expect(radio.classes()).not.toContain('is-checked');
    });
  });

  it('绑定值不匹配任何子项时组内无选中项（2.1 / 2.2）', () => {
    const wrapper = mountGroup({ modelValue: 'z' });
    const checked = groupInputs(wrapper).filter(
      (input) => (input.element as HTMLInputElement).checked,
    );
    expect(checked).toHaveLength(0);
  });
});

describe('AeroRadioGroup 选择派发与 change', () => {
  it('点击未选中子项更新绑定值并 emit change 携带新值（2.3）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    await clickRadio(wrapper, 1);
    const group = groupComponent(wrapper);
    expect(group.emitted('update:modelValue')!.at(-1)).toEqual(['b']);
    expect(group.emitted('change')!.at(-1)).toEqual(['b']);
  });

  it('点击另一个未选中子项同样携带其选项值（2.3）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    await clickRadio(wrapper, 2);
    const group = groupComponent(wrapper);
    expect(group.emitted('update:modelValue')!.at(-1)).toEqual(['c']);
    expect(group.emitted('change')!.at(-1)).toEqual(['c']);
  });

  it('点击已选中子项不派发 update:modelValue 与 change（2.3）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    await clickRadio(wrapper, 0);
    expect(groupComponent(wrapper).emitted('update:modelValue')).toBeUndefined();
    expect(groupComponent(wrapper).emitted('change')).toBeUndefined();
  });

  it('父组件回写组绑定值后选中态切换到新值（2.2 / 2.3 联动）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    await clickRadio(wrapper, 1);
    await wrapper.setProps({ groupProps: { modelValue: 'b' } });
    const radios = groupRadios(wrapper);
    expect(radios[0].classes()).not.toContain('is-checked');
    expect(radios[1].classes()).toContain('is-checked');
  });
});

describe('AeroRadioGroup 校验触发（validateEvent）', () => {
  it('值变化时触发表单项 change 校验（4.2）', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const wrapper = mountGroup(
      { modelValue: 'a' },
      undefined,
      makeFormItemContext({ validate, prop: 'radio' }),
    );
    await clickRadio(wrapper, 1);
    expect(groupComponent(wrapper).emitted('change')).toBeTruthy();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledWith('change');
  });

  it('点击已选中项（值未变化）不触发校验（4.2 边界）', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const wrapper = mountGroup(
      { modelValue: 'a' },
      undefined,
      makeFormItemContext({ validate }),
    );
    await clickRadio(wrapper, 0);
    expect(validate).not.toHaveBeenCalled();
  });

  it('validateEvent=false 时值变化派发 change 但不触发校验（2.8）', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const wrapper = mountGroup(
      { modelValue: 'a', validateEvent: false },
      undefined,
      makeFormItemContext({ validate }),
    );
    await clickRadio(wrapper, 1);
    // change 正常派发
    expect(groupComponent(wrapper).emitted('change')!.at(-1)).toEqual(['b']);
    expect(validate).not.toHaveBeenCalled();
  });
});

describe('AeroRadioGroup size 下发', () => {
  it('组 size 应用于组内所有子项（2.4）', () => {
    const wrapper = mountGroup({ modelValue: 'a', size: 'large' });
    groupRadios(wrapper).forEach((radio) => {
      expect(radio.classes()).toContain('aero-radio--large');
    });
  });

  it('子项自身 size 优先于组 size（2.4）', () => {
    const wrapper = mountGroupWithChildren(
      () => [
        h(AeroRadio, { value: 'a' }, () => '选项 A'),
        h(AeroRadio, { value: 'b', size: 'small' }, () => '选项 B'),
      ],
      { modelValue: 'a', size: 'large' },
    );
    const [, radioB] = groupRadios(wrapper);
    expect(radioSizeClasses(wrapper)).toEqual(['aero-radio--large']);
    expect(radioB.classes()).toContain('aero-radio--small');
    expect(radioB.classes()).not.toContain('aero-radio--large');
  });

  it('组 size 缺省回退 main，子项无尺寸修饰类（2.4）', () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    groupRadios(wrapper).forEach((radio) => {
      const sizeClasses = radio
        .classes()
        .filter((cls) => cls.startsWith('aero-radio--'));
      expect(sizeClasses).toEqual([]);
    });
  });
});

describe('AeroRadioGroup disabled 下发', () => {
  it('组 disabled 禁用所有子项且点击不派发事件（2.5）', async () => {
    const wrapper = mountGroup({ modelValue: 'a', disabled: true });
    const radios = groupRadios(wrapper);
    const inputs = groupInputs(wrapper);
    radios.forEach((radio) => {
      expect(radio.classes()).toContain('is-disabled');
    });
    inputs.forEach((input) => {
      expect(input.attributes('disabled')).toBeDefined();
    });
    await clickRadio(wrapper, 1);
    expect(groupComponent(wrapper).emitted('update:modelValue')).toBeUndefined();
    expect(groupComponent(wrapper).emitted('change')).toBeUndefined();
  });

  it('组未禁用时子项自身 disabled 仍生效，其余子项可点击（2.5）', async () => {
    const wrapper = mountGroupWithChildren(
      () => [
        h(AeroRadio, { value: 'a', disabled: true }, () => '选项 A'),
        h(AeroRadio, { value: 'b' }, () => '选项 B'),
      ],
      { modelValue: 'a' },
    );
    const [radioA, radioB] = groupRadios(wrapper);
    expect(radioA.classes()).toContain('is-disabled');
    expect(radioB.classes()).not.toContain('is-disabled');

    // 禁用子项不派发
    await clickRadio(wrapper, 0);
    expect(groupComponent(wrapper).emitted('change')).toBeUndefined();
    // 未禁用子项正常派发
    await clickRadio(wrapper, 1);
    expect(groupComponent(wrapper).emitted('change')!.at(-1)).toEqual(['b']);
  });
});

describe('AeroRadioGroup name 下发与原生分组', () => {
  it('组 name 透传给组内所有子项原生 radio（2.6）', () => {
    const wrapper = mountGroup({ modelValue: 'a', name: 'language' });
    groupInputs(wrapper).forEach((input) => {
      expect(input.attributes('name')).toBe('language');
    });
  });

  it('同组子项 name 一致，构成同一原生 radio 分组（5.2）', () => {
    const wrapper = mountGroup({ modelValue: 'a', name: 'language' });
    const names = groupInputs(wrapper).map(
      (input) => input.attributes('name'),
    );
    // 三个子项共享同一 name：浏览器原生按 name 分组，支持方向键组内切换（5.2）
    expect(new Set(names)).toEqual(new Set(['language']));
    expect(names).toHaveLength(3);
  });

  it('组 name 缺省且子项未声明时原生 radio 无 name 属性（2.6 边界）', () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    groupInputs(wrapper).forEach((input) => {
      expect(input.attributes('name')).toBeUndefined();
    });
  });

  it('不同组可使用不同 name，互不影响（5.2）', () => {
    const groupOne = mountGroup({ modelValue: 'a', name: 'group-one' });
    const groupTwo = mountGroup({ modelValue: 'a', name: 'group-two' });
    groupInputs(groupOne).forEach((input) => {
      expect(input.attributes('name')).toBe('group-one');
    });
    groupInputs(groupTwo).forEach((input) => {
      expect(input.attributes('name')).toBe('group-two');
    });
  });
});

describe('AeroRadioGroup fill / textColor 下发', () => {
  it('fill/textColor 应用于选中按钮样式子项的激活态行内样式（2.7）', () => {
    const wrapper = mountGroupWithChildren(
      () => [
        h(AeroRadioButton, { value: 'a' }, () => '按钮 A'),
        h(AeroRadioButton, { value: 'b' }, () => '按钮 B'),
      ],
      { modelValue: 'b', fill: '#ff0000', textColor: '#ffffff' },
    );
    const buttons = wrapper.findAll('.aero-radio-button');
    const checkedButton = buttons[1].element as HTMLElement;
    expect(buttons[1].classes()).toContain('is-checked');
    expect(checkedButton.style.backgroundColor).toBe('rgb(255, 0, 0)');
    expect(checkedButton.style.color).toBe('rgb(255, 255, 255)');
  });

  it('未选中的按钮样式子项不应用激活态行内样式（2.7）', () => {
    const wrapper = mountGroupWithChildren(
      () => [
        h(AeroRadioButton, { value: 'a' }, () => '按钮 A'),
        h(AeroRadioButton, { value: 'b' }, () => '按钮 B'),
      ],
      { modelValue: 'b', fill: '#ff0000', textColor: '#ffffff' },
    );
    const unchecked = wrapper.findAll('.aero-radio-button')[0];
    expect(unchecked.classes()).not.toContain('is-checked');
    expect(unchecked.attributes('style')).toBeUndefined();
  });

  it('组绑定值切换后 fill/textColor 激活态样式跟随迁移（2.7 / 2.2 联动）', async () => {
    const wrapper = mountGroupWithChildren(
      () => [
        h(AeroRadioButton, { value: 'a' }, () => '按钮 A'),
        h(AeroRadioButton, { value: 'b' }, () => '按钮 B'),
      ],
      { modelValue: 'a', fill: '#00ff00', textColor: '#000000' },
    );
    // 回写绑定值时保留 fill/textColor（与 v-model 绑定场景一致）
    await wrapper.setProps({
      groupProps: { modelValue: 'b', fill: '#00ff00', textColor: '#000000' },
    });
    const buttons = wrapper.findAll('.aero-radio-button');
    expect((buttons[0].element as HTMLElement).style.backgroundColor).toBe('');
    expect((buttons[1].element as HTMLElement).style.backgroundColor).toBe(
      'rgb(0, 255, 0)',
    );
  });
});

describe('AeroRadioGroup 表单集成', () => {
  it('继承表单级 size 与 disabled 并下发子项（4.1）', () => {
    const wrapper = mountGroup(
      { modelValue: 'a' },
      makeFormContext({ size: 'small', disabled: true }),
    );
    groupRadios(wrapper).forEach((radio) => {
      expect(radio.classes()).toContain('aero-radio--small');
      expect(radio.classes()).toContain('is-disabled');
    });
    groupInputs(wrapper).forEach((input) => {
      expect(input.attributes('disabled')).toBeDefined();
    });
  });

  it('继承表单项级 size 与 disabled（4.1）', () => {
    const wrapper = mountGroup(
      { modelValue: 'a' },
      makeFormContext(),
      makeFormItemContext({ size: 'large', disabled: true }),
    );
    groupRadios(wrapper).forEach((radio) => {
      expect(radio.classes()).toContain('aero-radio--large');
      expect(radio.classes()).toContain('is-disabled');
    });
  });

  it('组自身显式 size/disabled 优先于表单上下文（4.1）', () => {
    const wrapper = mountGroup(
      { modelValue: 'a', size: 'main', disabled: false },
      makeFormContext({ size: 'small', disabled: true }),
      makeFormItemContext({ size: 'large', disabled: true }),
    );
    groupRadios(wrapper).forEach((radio) => {
      expect(radio.classes()).not.toContain('is-disabled');
      expect(radio.classes()).not.toContain('aero-radio--small');
      expect(radio.classes()).not.toContain('aero-radio--large');
    });
    groupInputs(wrapper).forEach((input) => {
      expect(input.attributes('disabled')).toBeUndefined();
    });
  });

  it('表单 disabled 继承下点击子项不派发事件（4.1 / 2.5 联动）', async () => {
    const wrapper = mountGroup(
      { modelValue: 'a' },
      makeFormContext({ disabled: true }),
    );
    await clickRadio(wrapper, 1);
    expect(groupComponent(wrapper).emitted('update:modelValue')).toBeUndefined();
    expect(groupComponent(wrapper).emitted('change')).toBeUndefined();
  });

  it('脱离表单上下文挂载不抛错且可正常交互（4.1 对照）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    expect(wrapper.find('.aero-radio-group').exists()).toBe(true);
    await clickRadio(wrapper, 1);
    expect(groupComponent(wrapper).emitted('change')!.at(-1)).toEqual(['b']);
  });
});
