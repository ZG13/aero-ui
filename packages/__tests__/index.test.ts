import { describe, expect, it } from 'vitest';
import { createApp } from 'vue';
import AeroUI, { AeroButton, AeroIcon, AeroInput } from '../index';

describe('根 barrel 与 AeroUI 全局注册', () => {
  it('根入口具名导出三个组件', () => {
    expect(AeroButton).toBeDefined();
    expect(AeroInput).toBeDefined();
    expect(AeroIcon).toBeDefined();
    expect(typeof AeroButton.install).toBe('function');
  });

  it('默认导出 AeroUI 含 install，app.use 后三个组件全局可用', () => {
    expect(typeof AeroUI.install).toBe('function');

    const app = createApp({ template: '<div />' });
    app.use(AeroUI);

    expect(app.component('AeroButton')).toBeTruthy();
    expect(app.component('AeroInput')).toBeTruthy();
    expect(app.component('AeroIcon')).toBeTruthy();
  });
});
