import { describe, expect, it } from 'vitest';
import { createApp } from 'vue';
import AeroUI, {
  AeroButton,
  AeroForm,
  AeroFormItem,
  AeroIcon,
  AeroInput,
} from '../index';

describe('根 barrel 与 AeroUI 全局注册', () => {
  it('根入口具名导出全部组件', () => {
    expect(AeroButton).toBeDefined();
    expect(AeroInput).toBeDefined();
    expect(AeroIcon).toBeDefined();
    expect(AeroForm).toBeDefined();
    expect(AeroFormItem).toBeDefined();
    expect(typeof AeroButton.install).toBe('function');
    expect(typeof AeroForm.install).toBe('function');
    expect(typeof AeroFormItem.install).toBe('function');
  });

  it('默认导出 AeroUI 含 install，app.use 后全部组件全局可用', () => {
    expect(typeof AeroUI.install).toBe('function');

    const app = createApp({ template: '<div />' });
    app.use(AeroUI);

    expect(app.component('AeroButton')).toBeTruthy();
    expect(app.component('AeroInput')).toBeTruthy();
    expect(app.component('AeroIcon')).toBeTruthy();
    expect(app.component('AeroForm')).toBeTruthy();
    expect(app.component('AeroFormItem')).toBeTruthy();
  });
});
