import type { App } from 'vue';
import Icon from './src/Icon.vue';

const AeroIcon = Icon as typeof Icon & {
  install: (app: App) => void;
};

AeroIcon.install = (app: App): void => {
  app.component('AeroIcon', AeroIcon);
};

export { AeroIcon };
export default AeroIcon;
export * from './types';
