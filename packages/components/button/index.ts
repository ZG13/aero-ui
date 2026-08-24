import type { App } from 'vue';
import Button from './src/Button.vue';

const AeroButton = Button as typeof Button & {
  install: (app: App) => void;
};

AeroButton.install = (app: App): void => {
  app.component('AeroButton', AeroButton);
};

export { AeroButton };
export default AeroButton;
export * from './types';
