import { describe, expect, it, vi, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { mount, enableAutoUnmount, type VueWrapper } from '@vue/test-utils';
import { AeroRadioButton, AeroRadioGroup } from '../index';
import { formItemContextKey } from '../../form/src/constants';
import type { FormItemContext } from '../../form/src/constants';

enableAutoUnmount(afterEach);

// —— 查询辅助 ——

/** 查找独立场景下被测按钮单选的原生 radio input */
function originalInput(wrapper: VueWrapper) {
  return wrapper.find('input[type="radio"]');
}

/** 点击指定序号的原生 radio */
async function clickRadio(wrapper: VueWrapper, index = 0): Promise<void> {
  await wrapper.findAll('input[type="radio"]')[index].trigger('click');
}

/** 查找所有按钮单选根 label */
function allButtons(wrapper: VueWrapper) {
  return wrapper.findAll('.aero-radio-button');
}

describe('AeroRadioButton 按钮外观渲染（3.1）', () => {
  it('以按钮外观渲染：aero-radio-button 类 + 文案插槽 + 原生 radio input（3.1 / 5.1）', () => {
    const wrapper = mount(AeroRadioButton, {
      props: { value: 'a' },
      slots: { default: () => '按钮 A' },
    });

    // 根元素为按钮样式类
    expect(wrapper.find('.aero-radio-button').exists()).toBe(true);
    // 文案插槽渲染
    expect(wrapper.find('.aero-radio-button__text').text()).toBe('按钮 A');
    // 底层承载语义的原生 radio input
    const input = originalInput(wrapper);
    expect(input.exists()).toBe(true);
    expect((input.element as HTMLInputElement).type).toBe('radio');
  });

  it('位于 RadioGroup 内时继承组绑定值与选中态（3.1）', () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(AeroRadioGroup, { modelValue: 'b' }, {
            default: () => [
              h(AeroRadioButton, { value: 'a' }, () => '按钮 A'),
              h(AeroRadioButton, { value: 'b' }, () => '按钮 B'),
            ],
          });
      },
    });
    const wrapper = mount(Host);
    const [buttonA, buttonB] = allButtons(wrapper);

    expect(buttonA.classes()).not.toContain('is-checked');
    expect(buttonB.classes()).toContain('is-checked');
    // 组绑定值驱动原生 radio 受控选中态
    const inputs = wrapper.findAll('input[type="radio"]');
    expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
    expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
  });
});

describe('AeroRadioButton fill / textColor 激活态（3.2）', () => {
  it('选中时以组下发的 fill 为背景色、textColor 为文字色（行内 style）（3.2）', () => {
    const wrapper = mountWrapper({
      modelValue: 'b',
      fill: '#ff0000',
      textColor: '#ffffff',
    });
    const [buttonA, buttonB] = allButtons(wrapper);

    expect(buttonA.classes()).not.toContain('is-checked');
    expect(buttonB.classes()).toContain('is-checked');

    const checkedEl = buttonB.element as HTMLElement;
    expect(checkedEl.style.backgroundColor).toBe('rgb(255, 0, 0)');
    expect(checkedEl.style.color).toBe('rgb(255, 255, 255)');
    // 未选中项不应用激活态行内样式
    expect((buttonA.element as HTMLElement).style.backgroundColor).toBe('');
    expect((buttonA.element as HTMLElement).style.color).toBe('');
  });

  it('组绑定值切换后 fill/textColor 行内样式随选中项迁移（3.2 联动）', async () => {
    const wrapper = mountWrapper({
      modelValue: 'a',
      fill: '#00ff00',
      textColor: '#000000',
    });
    expect(
      (allButtons(wrapper)[0].element as HTMLElement).style.backgroundColor,
    ).toBe('rgb(0, 255, 0)');

    // 回写绑定值时保留 fill/textColor（与 v-model 绑定场景一致）
    await wrapper.setProps({
      groupProps: { modelValue: 'b', fill: '#00ff00', textColor: '#000000' },
    });
    const [buttonA, buttonB] = allButtons(wrapper);
    expect((buttonA.element as HTMLElement).style.backgroundColor).toBe('');
    expect((buttonB.element as HTMLElement).style.backgroundColor).toBe(
      'rgb(0, 255, 0)',
    );
  });
});

describe('AeroRadioButton 缺省主题色回退（3.3）', () => {
  it('组未下发 fill/textColor 时选中项无行内样式覆盖，仅 is-checked 类由样式层兜底（3.3）', () => {
    const wrapper = mountWrapper({ modelValue: 'b' });
    const [buttonA, buttonB] = allButtons(wrapper);

    expect(buttonB.classes()).toContain('is-checked');
    const checkedEl = buttonB.element as HTMLElement;
    // 无 fill/textColor 下发：不产生行内颜色覆盖
    expect(checkedEl.style.backgroundColor).toBe('');
    expect(checkedEl.style.color).toBe('');
    expect(buttonA.classes()).not.toContain('is-checked');
  });

  it('独立使用（无组上下文）时同样无行内样式覆盖（3.3）', () => {
    const wrapper = mount(AeroRadioButton, {
      props: { value: 'a', modelValue: 'a' },
    });
    expect(wrapper.find('.aero-radio-button').classes()).toContain(
      'is-checked',
    );
    const el = wrapper.find('.aero-radio-button').element as HTMLElement;
    expect(el.style.backgroundColor).toBe('');
    expect(el.style.color).toBe('');
  });
});

describe('AeroRadioButton 禁用态（3.4）', () => {
  it('自身 disabled：呈现禁用态且点击不派发事件（3.4）', async () => {
    const wrapper = mount(AeroRadioButton, {
      props: { value: 'b', modelValue: 'a', disabled: true },
    });
    expect(wrapper.find('.aero-radio-button').classes()).toContain(
      'is-disabled',
    );
    expect(originalInput(wrapper).attributes('disabled')).toBeDefined();

    await clickRadio(wrapper);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  it('组 disabled 下发：按钮禁用且点击不上报组 change（3.4 / 2.5 联动）', async () => {
    const wrapper = mountWrapper({ modelValue: 'a', disabled: true });
    const buttons = allButtons(wrapper);
    buttons.forEach((button) => {
      expect(button.classes()).toContain('is-disabled');
    });
    wrapper.findAll('input[type="radio"]').forEach((input) => {
      expect(input.attributes('disabled')).toBeDefined();
    });

    await clickRadio(wrapper, 1);
    const group = wrapper.findComponent(AeroRadioGroup);
    expect(group.emitted('update:modelValue')).toBeUndefined();
    expect(group.emitted('change')).toBeUndefined();
  });
});

describe('AeroRadioButton 脱离 group 独立使用（3.5）', () => {
  it('按自身 modelValue 呈现选中态（3.5）', () => {
    const checked = mount(AeroRadioButton, {
      props: { value: 'a', modelValue: 'a' },
      slots: { default: () => '按钮 A' },
    });
    expect(checked.find('.aero-radio-button').classes()).toContain(
      'is-checked',
    );
    expect((originalInput(checked).element as HTMLInputElement).checked).toBe(
      true,
    );

    const unchecked = mount(AeroRadioButton, {
      props: { value: 'b', modelValue: 'a' },
    });
    expect(unchecked.find('.aero-radio-button').classes()).not.toContain(
      'is-checked',
    );
    expect((originalInput(unchecked).element as HTMLInputElement).checked).toBe(
      false,
    );
  });

  it('点击未选中项 emit update:modelValue 与 change（携带自身选项值）（3.5）', async () => {
    const wrapper = mount(AeroRadioButton, {
      props: { value: 'b', modelValue: 'a' },
      slots: { default: () => '按钮 B' },
    });
    await clickRadio(wrapper);
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['b']);
    expect(wrapper.emitted('change')!.at(-1)).toEqual(['b']);
  });

  it('点击已选中项保持选中态不变且不触发 change（3.5 对照）', async () => {
    const wrapper = mount(AeroRadioButton, {
      props: { value: 'a', modelValue: 'a' },
    });
    await clickRadio(wrapper);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.find('.aero-radio-button').classes()).toContain(
      'is-checked',
    );
  });

  it('独立存在表单项上下文时值变化触发 change 校验（3.5 / 4.2 联动）', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const formItem = { validate } as unknown as FormItemContext;
    const wrapper = mount(AeroRadioButton, {
      props: { value: 'b', modelValue: 'a' },
      global: { provide: { [formItemContextKey as symbol]: formItem } },
    });
    await clickRadio(wrapper);
    expect(validate).toHaveBeenCalledWith('change');
  });
});

describe('AeroRadioButton 原生语义（5.1）', () => {
  it('原生 radio 的 checked 与 aria-checked 随选中态同步（5.1）', async () => {
    const wrapper = mount(AeroRadioButton, {
      props: { value: 'b', modelValue: 'a' },
    });
    const input = originalInput(wrapper);
    expect(input.attributes('aria-checked')).toBe('false');
    expect((input.element as HTMLInputElement).checked).toBe(false);

    // 父组件回写绑定值后受控选中态与语义属性同步
    await wrapper.setProps({ modelValue: 'b' });
    expect(input.attributes('aria-checked')).toBe('true');
    expect((input.element as HTMLInputElement).checked).toBe(true);
  });

  it('组内 name 透传到按钮原生 radio（5.1 / 2.6 联动）', () => {
    const wrapper = mountWrapper({ modelValue: 'a', name: 'layout' });
    wrapper.findAll('input[type="radio"]').forEach((input) => {
      expect(input.attributes('name')).toBe('layout');
    });
  });
});

// —— 辅助：以响应式 groupProps 挂载 RadioGroup + 两个 AeroRadioButton ——

function mountWrapper(groupProps: Record<string, unknown>): VueWrapper {
  const Host = defineComponent({
    name: 'ButtonGroupHost',
    props: {
      groupProps: {
        type: Object as PropType<Record<string, unknown>>,
        default: () => ({}),
      },
    },
    setup(props) {
      return () =>
        h(AeroRadioGroup, props.groupProps, {
          default: () => [
            h(AeroRadioButton, { value: 'a' }, () => '按钮 A'),
            h(AeroRadioButton, { value: 'b' }, () => '按钮 B'),
          ],
        });
    },
  });
  return mount(Host, { props: { groupProps } });
}
