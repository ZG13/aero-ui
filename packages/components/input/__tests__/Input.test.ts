import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AeroInput from '../index';

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
