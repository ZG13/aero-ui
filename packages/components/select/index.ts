import type { App } from 'vue';
import Select from './src/Select.vue';
import Option from './src/Option.vue';

const AeroSelect = Select as typeof Select & {
  install: (app: App) => void;
};

AeroSelect.install = (app: App): void => {
  app.component('AeroSelect', AeroSelect);
};

const AeroOption = Option as typeof Option & {
  install: (app: App) => void;
};

AeroOption.install = (app: App): void => {
  app.component('AeroOption', AeroOption);
};

export { AeroSelect, AeroOption };
export default AeroSelect;
export * from './types';
