import type { App } from 'vue';
import FormItem from './src/FormItem.vue';

const AeroFormItem = FormItem as typeof FormItem & {
  install: (app: App) => void;
};

AeroFormItem.install = (app: App): void => {
  app.component('AeroFormItem', AeroFormItem);
};

export { AeroFormItem };
export default AeroFormItem;
export * from './types';
