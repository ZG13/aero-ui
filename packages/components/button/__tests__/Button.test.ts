import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AeroButton from '../index';

describe('AeroButton', () => {
  it('默认渲染为 button，含 aero-button 类', () => {
    const wrapper = mount(AeroButton, { slots: { default: '确定' } });
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.classes()).toContain('aero-button');
    expect(wrapper.text()).toContain('确定');
  });

  it('type / size 产生对应类名', () => {
    const wrapper = mount(AeroButton, {
      props: { type: 'danger', size: 'small' },
      slots: { default: 'x' },
    });
    expect(wrapper.classes()).toContain('aero-button--danger');
    expect(wrapper.classes()).toContain('aero-button--size-small');
  });

  it('nativeType 映射到原生按钮类型', () => {
    const wrapper = mount(AeroButton, { props: { nativeType: 'submit' } });
    expect(wrapper.find('button').attributes('type')).toBe('submit');
  });

  it('disabled 时不触发 click', async () => {
    const wrapper = mount(AeroButton, { props: { disabled: true } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('loading 时不触发 click 且展示加载文案', () => {
    const wrapper = mount(AeroButton, { props: { loading: true } });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('加载中');
  });

  it('正常点击派发 click 事件', async () => {
    const wrapper = mount(AeroButton);
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('icon 渲染 AeroIcon', () => {
    const wrapper = mount(AeroButton, { props: { icon: 'search' } });
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('导出对象带 install 方法', () => {
    expect(typeof AeroButton.install).toBe('function');
  });
});
