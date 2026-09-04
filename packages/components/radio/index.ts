import type { App } from 'vue';
import Radio from './src/Radio.vue';
import RadioGroup from './src/RadioGroup.vue';
import RadioButton from './src/RadioButton.vue';

// 三个组件各自携带手写 install，支持独立 app.use / 全局注册
const AeroRadio = Radio as typeof Radio & {
  install: (app: App) => void;
};

AeroRadio.install = (app: App): void => {
  app.component('AeroRadio', AeroRadio);
};

const AeroRadioGroup = RadioGroup as typeof RadioGroup & {
  install: (app: App) => void;
};

AeroRadioGroup.install = (app: App): void => {
  app.component('AeroRadioGroup', AeroRadioGroup);
};

const AeroRadioButton = RadioButton as typeof RadioButton & {
  install: (app: App) => void;
};

AeroRadioButton.install = (app: App): void => {
  app.component('AeroRadioButton', AeroRadioButton);
};

export { AeroRadio, AeroRadioGroup, AeroRadioButton };
export default AeroRadio;
export * from './types';
