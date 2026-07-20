import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '../src/Button.vue';

describe('EpButton', () => {
  it('renders default slot text', () => {
    const wrapper = mount(Button, { slots: { default: 'Primary' } });
    expect(wrapper.text()).toContain('Primary');
    expect(wrapper.classes()).toContain('ep-button');
  });

  it('applies type / size / variant classes', () => {
    const wrapper = mount(Button, {
      props: { type: 'danger', size: 'large', variant: 'plain' },
    });
    expect(wrapper.classes()).toContain('ep-button--danger');
    expect(wrapper.classes()).toContain('ep-button--large');
    expect(wrapper.classes()).toContain('ep-button--plain');
  });

  it('uses default props (primary / middle / solid)', () => {
    const wrapper = mount(Button);
    expect(wrapper.classes()).toContain('ep-button--primary');
    expect(wrapper.classes()).toContain('ep-button--middle');
    expect(wrapper.classes()).toContain('ep-button--solid');
  });

  it('emits click when enabled', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('does not emit click when loading', async () => {
    const wrapper = mount(Button, { props: { loading: true } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
    expect(wrapper.classes()).toContain('is-loading');
  });

  it('renders round and icon-only states', () => {
    const wrapper = mount(Button, { props: { round: true, icon: 'ep-icon-search' } });
    expect(wrapper.classes()).toContain('is-round');
    expect(wrapper.classes()).toContain('is-icon-only');
  });

  it('renders icon slot', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Text', icon: '<i class="custom-icon" />' },
    });
    expect(wrapper.find('.custom-icon').exists()).toBe(true);
  });

  it('respects nativeType', () => {
    const wrapper = mount(Button, { props: { nativeType: 'submit' } });
    expect(wrapper.attributes('type')).toBe('submit');
  });

  it('sets aria attributes when loading', () => {
    const wrapper = mount(Button, { props: { loading: true } });
    expect(wrapper.attributes('aria-busy')).toBe('true');
  });
});
