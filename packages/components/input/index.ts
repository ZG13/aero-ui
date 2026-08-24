import type { App } from 'vue';
import Input from './src/Input.vue';

const AeroInput = Input as typeof Input & {
  install: (app: App) => void;
};

AeroInput.install = (app: App): void => {
  app.component('AeroInput', AeroInput);
};

export { AeroInput };
export default AeroInput;
export * from './types';
