import type { App } from 'vue';
import DatePicker from './src/DatePicker.vue';

const AeroDatePicker = DatePicker as typeof DatePicker & {
  install: (app: App) => void;
};

AeroDatePicker.install = (app: App): void => {
  app.component('AeroDatePicker', AeroDatePicker);
};

export { AeroDatePicker };
export default AeroDatePicker;
export * from './types';
