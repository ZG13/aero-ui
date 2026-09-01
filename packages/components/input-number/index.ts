import type { App } from 'vue';
import InputNumber from './src/InputNumber.vue';

const AeroInputNumber = InputNumber as typeof InputNumber & {
  install: (app: App) => void;
};

AeroInputNumber.install = (app: App): void => {
  app.component('AeroInputNumber', AeroInputNumber);
};

export { AeroInputNumber };
export default AeroInputNumber;
export * from './types';
