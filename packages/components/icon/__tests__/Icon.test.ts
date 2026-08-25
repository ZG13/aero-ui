import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AeroIcon from '../index';

describe('AeroIcon', () => {
  it('已知 name 渲染 SVG', () => {
    const wrapper = mount(AeroIcon, { props: { name: 'search' } });
    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('path').exists()).toBe(true);
  });

  it('新增图标 settings / link 可渲染', () => {
    for (const name of ['settings', 'link']) {
      const wrapper = mount(AeroIcon, { props: { name } });
      expect(wrapper.find('svg').exists()).toBe(true);
      expect(wrapper.find('path').exists()).toBe(true);
    }
  });

  it('size 控制尺寸（数字按 px，字符串直接透传）', () => {
    const px = mount(AeroIcon, { props: { name: 'search', size: 24 } });
    expect(px.find('svg').attributes('width')).toBe('24px');
    expect(px.find('svg').attributes('height')).toBe('24px');

    const em = mount(AeroIcon, { props: { name: 'search', size: '2em' } });
    expect(em.find('svg').attributes('width')).toBe('2em');
  });

  it('color 默认 --aero-neutral-10，传值后生效', () => {
    const def = mount(AeroIcon, { props: { name: 'search' } });
    expect(def.find('svg').element.style.color).toBe('var(--aero-neutral-10)');

    const colored = mount(AeroIcon, { props: { name: 'search', color: '#123456' } });
    expect(colored.find('svg').element.style.color).toBeTruthy();
  });

  it('未知 name 渲染为空内容且不抛错', () => {
    const wrapper = mount(AeroIcon, { props: { name: 'unknown' } });
    expect(wrapper.find('svg').exists()).toBe(false);
  });

  it('导出对象带 install 方法', () => {
    expect(typeof AeroIcon.install).toBe('function');
  });
});
