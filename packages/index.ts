// aero-ui 库根入口（root barrel）
import { AeroButton } from './components/button';
import { AeroInput } from './components/input';
import { AeroIcon } from './components/icon';
import { AeroForm } from './components/form';
import { AeroFormItem } from './components/form-item';
import type { App } from 'vue';

export * from './components';
export * from './locale';

const AeroUI = {
  install(app: App): void {
    app.use(AeroButton);
    app.use(AeroInput);
    app.use(AeroIcon);
    app.use(AeroForm);
    app.use(AeroFormItem);
  },
};

export default AeroUI;
