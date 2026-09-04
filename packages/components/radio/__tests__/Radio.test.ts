import { describe, expect, it, vi, afterEach } from 'vitest';
import { defineComponent, h, provide } from 'vue';
import type { PropType } from 'vue';
import { mount, enableAutoUnmount, type VueWrapper } from '@vue/test-utils';
import { AeroRadio, AeroRadioGroup } from '../index';
import { formItemContextKey } from '../../form/src/constants';
import type { FormItemContext } from '../../form/src/constants';

enableAutoUnmount(afterEach);

/** 查找独立场景下被测单选项的原生 radio input */
function originalInput(wrapper: VueWrapper) {
  return wrapper.find('input[type="radio"]');
}

/** 查找根 label 上的尺寸修饰类（aero-radio--xxx） */
function sizeModifiers(wrapper: VueWrapper): string[] {
  return wrapper
    .find('.aero-radio')
    .classes()
    .filter((cls) => cls.startsWith('aero-radio--'));
}

/** 点击指定序号的原生 radio（findInput 返回 wrapper，用于独立/组内两种查找方式） */
async function clickRadio(wrapper: VueWrapper, index = 0): Promise<void> {
  await wrapper.findAll('input[type="radio"]')[index].trigger('click');
}

describe('AeroRadio 独立使用', () => {
  it('渲染原生 radio input，文案与圆点容器存在（1.1 / 5.1）', () => {
    const wrapper = mount(AeroRadio, {
      props: { value: 'a' },
      slots: { default: () => '选项 A' },
    });
    const input = originalInput(wrapper);
    expect(input.exists()).toBe(true);
    expect((input.element as HTMLInputElement).type).toBe('radio');
    expect(wrapper.find('.aero-radio__dot').exists()).toBe(true);
    expect(wrapper.find('.aero-radio__text').text()).toBe('选项 A');
  });

  it('绑定值等于选项值时呈现选中态（1.2 独立场景）', () => {
    const wrapper = mount(AeroRadio, { props: { value: 'a', modelValue: 'a' } });
    expect(wrapper.find('.aero-radio').classes()).toContain('is-checked');
    expect((originalInput(wrapper).element as HTMLInputElement).checked).toBe(true);
  });

  it('绑定值变化时选中态随之切换（1.2 独立场景）', async () => {
    const wrapper = mount(AeroRadio, { props: { value: 'a', modelValue: 'a' } });
    expect(wrapper.find('.aero-radio').classes()).toContain('is-checked');
    await wrapper.setProps({ modelValue: 'b' });
    expect(wrapper.find('.aero-radio').classes()).not.toContain('is-checked');
    expect((originalInput(wrapper).element as HTMLInputElement).checked).toBe(false);
  });

  it('点击未选中项派发 update:modelValue 与 change（携带新值）（1.3 独立场景）', async () => {
    const wrapper = mount(AeroRadio, { props: { value: 'b', modelValue: 'a' } });
    await clickRadio(wrapper);
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['b']);
    expect(wrapper.emitted('change')!.at(-1)).toEqual(['b']);
  });

  it('点击未选中项后选中态切换（1.2 / 1.3 独立场景）', async () => {
    const wrapper = mount(AeroRadio, { props: { value: 'b', modelValue: 'a' } });
    expect(wrapper.find('.aero-radio').classes()).not.toContain('is-checked');
    await clickRadio(wrapper);
    // 点击派发 update:modelValue，父组件回写 modelValue 前不改变受控选中态；
    // 此处验证由父回写驱动选中态切换
    await wrapper.setProps({ modelValue: 'b' });
    expect(wrapper.find('.aero-radio').classes()).toContain('is-checked');
  });

  it('点击已选中项不派发 update:modelValue 与 change（1.4）', async () => {
    const wrapper = mount(AeroRadio, { props: { value: 'a', modelValue: 'a' } });
    await clickRadio(wrapper);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  it('点击已选中项保持选中态不变（1.4）', async () => {
    const wrapper = mount(AeroRadio, { props: { value: 'a', modelValue: 'a' } });
    await clickRadio(wrapper);
    expect(wrapper.find('.aero-radio').classes()).toContain('is-checked');
    expect(wrapper.props('modelValue')).toBe('a');
  });

  it('disabled 时呈现禁用态且点击不派发事件（1.5）', async () => {
    const wrapper = mount(AeroRadio, {
      props: { value: 'a', disabled: true },
    });
    expect(wrapper.find('.aero-radio').classes()).toContain('is-disabled');
    expect(originalInput(wrapper).attributes('disabled')).toBeDefined();
    await clickRadio(wrapper);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  it('border 时根元素带 is-border 类（1.6）', () => {
    const withBorder = mount(AeroRadio, { props: { value: 'a', border: true } });
    expect(withBorder.find('.aero-radio').classes()).toContain('is-border');

    const withoutBorder = mount(AeroRadio, { props: { value: 'a' } });
    expect(withoutBorder.find('.aero-radio').classes()).not.toContain('is-border');
  });

  it('size=large / small 应用对应修饰类（1.7）', () => {
    const large = mount(AeroRadio, { props: { value: 'a', size: 'large' } });
    expect(sizeModifiers(large)).toEqual(['aero-radio--large']);

    const small = mount(AeroRadio, { props: { value: 'a', size: 'small' } });
    expect(sizeModifiers(small)).toEqual(['aero-radio--small']);
  });

  it('size 缺省回退 main，根元素无尺寸修饰类（1.7）', () => {
    const wrapper = mount(AeroRadio, { props: { value: 'a' } });
    expect(wrapper.find('.aero-radio').classes()).toContain('aero-radio');
    expect(sizeModifiers(wrapper)).toEqual([]);
  });

  it('name 透传到原生 radio 的 name 属性（1.8）', () => {
    const wrapper = mount(AeroRadio, { props: { value: 'a', name: 'gender' } });
    expect(originalInput(wrapper).attributes('name')).toBe('gender');
  });

  it('name 未设置时原生 radio 无 name 属性（1.8）', () => {
    const wrapper = mount(AeroRadio, { props: { value: 'a' } });
    expect(originalInput(wrapper).attributes('name')).toBeUndefined();
  });

  it('value 未设置时回退 label 作为选项值（1.9）', async () => {
    // 选中态判定使用 label
    const wrapper = mount(AeroRadio, { props: { label: 'b', modelValue: 'b' } });
    expect(wrapper.find('.aero-radio').classes()).toContain('is-checked');

    // 点击派发的也是 label
    const unchecked = mount(AeroRadio, { props: { label: 'b', modelValue: 'a' } });
    await clickRadio(unchecked);
    expect(unchecked.emitted('update:modelValue')!.at(-1)).toEqual(['b']);
    expect(unchecked.emitted('change')!.at(-1)).toEqual(['b']);
  });

  it('value 显式声明时优先于 label（1.9）', () => {
    const wrapper = mount(AeroRadio, {
      props: { value: 'a', label: 'b', modelValue: 'a' },
    });
    expect(wrapper.find('.aero-radio').classes()).toContain('is-checked');

    const mismatch = mount(AeroRadio, {
      props: { value: 'a', label: 'b', modelValue: 'b' },
    });
    expect(mismatch.find('.aero-radio').classes()).not.toContain('is-checked');
  });

  it('脱离表单与分组直接挂载不抛错且可正常交互（4.3）', async () => {
    const wrapper = mount(AeroRadio, { props: { value: 'a' } });
    expect(wrapper.find('.aero-radio').exists()).toBe(true);
    await clickRadio(wrapper);
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['a']);
    expect(wrapper.emitted('change')!.at(-1)).toEqual(['a']);
  });

  it('独立场景存在表单项上下文时 change 校验被触发（4.2 联动）', async () => {
    const validate = vi.fn(() => Promise.resolve([]));
    const formItem = { validate } as unknown as FormItemContext;
    const wrapper = mount(AeroRadio, {
      props: { value: 'a' },
      global: { provide: { [formItemContextKey as symbol]: formItem } },
    });
    await clickRadio(wrapper);
    expect(validate).toHaveBeenCalledWith('change');
  });
});

// —— 组内使用（AeroRadioGroup 场景） ——

/** 宿主组件：按需 provide formItemContext，并以响应式 groupProps 渲染 RadioGroup（参照 use-form.test.ts 的 Provider 方式） */
const Provider = defineComponent({
  props: {
    formItem: { type: Object as PropType<FormItemContext> },
    groupProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    if (props.formItem) provide(formItemContextKey, props.formItem);
    return () =>
      h(AeroRadioGroup, props.groupProps, {
        default: () => [
          h(AeroRadio, { value: 'a' }, () => '选项 A'),
          h(AeroRadio, { value: 'b' }, () => '选项 B'),
        ],
      });
  },
});

function mountGroup(
  props: Record<string, unknown> = {},
  formItem?: FormItemContext,
) {
  return mount(Provider, {
    props: { formItem, groupProps: props },
  });
}

function groupRadios(wrapper: VueWrapper) {
  return wrapper.findAll('.aero-radio');
}

describe('AeroRadio 组内使用', () => {
  it('组绑定值匹配的子项呈选中态，其余未选中（1.2 组内场景 / 2.2）', () => {
    const wrapper = mountGroup({ modelValue: 'b' });
    const [radioA, radioB] = groupRadios(wrapper);
    expect(radioA.classes()).not.toContain('is-checked');
    expect(radioB.classes()).toContain('is-checked');
    expect(
      (wrapper.findAll('input[type="radio"]')[1].element as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it('组绑定值变化时选中项随之切换（1.2 组内场景 / 2.1）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    expect(groupRadios(wrapper)[0].classes()).toContain('is-checked');
    await wrapper.setProps({ groupProps: { modelValue: 'b' } });
    const [radioA, radioB] = groupRadios(wrapper);
    expect(radioA.classes()).not.toContain('is-checked');
    expect(radioB.classes()).toContain('is-checked');
  });

  it('点击组内未选中项经 changeEvent 更新组值并触发 change（1.3 组内场景 / 2.3）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    // 点击第二个子项（value=b），由容器统一派发 update:modelValue / change
    await clickRadio(wrapper, 1);
    const groupWrapper = wrapper.findComponent(AeroRadioGroup);
    expect(groupWrapper.emitted('update:modelValue')!.at(-1)).toEqual(['b']);
    expect(groupWrapper.emitted('change')!.at(-1)).toEqual(['b']);
  });

  it('点击组内已选中项不触发组 change（1.4 组内场景）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    await clickRadio(wrapper, 0);
    const groupWrapper = wrapper.findComponent(AeroRadioGroup);
    expect(groupWrapper.emitted('update:modelValue')).toBeUndefined();
    expect(groupWrapper.emitted('change')).toBeUndefined();
  });

  it('组内点击经容器派发后选中态由组回写驱动（1.2 / 1.3 组内场景）', async () => {
    const wrapper = mountGroup({ modelValue: 'a' });
    await clickRadio(wrapper, 1);
    await wrapper.setProps({ groupProps: { modelValue: 'b' } });
    const [radioA, radioB] = groupRadios(wrapper);
    expect(radioA.classes()).not.toContain('is-checked');
    expect(radioB.classes()).toContain('is-checked');
  });
});
