import type { App } from 'vue';
import Form from './src/Form.vue';

const AeroForm = Form as typeof Form & {
  install: (app: App) => void;
};

AeroForm.install = (app: App): void => {
  app.component('AeroForm', AeroForm);
};

export { AeroForm };
export default AeroForm;
export * from './types';
