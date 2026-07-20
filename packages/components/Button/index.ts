import type { App, Plugin } from 'vue';
import Button from './src/Button.vue';
import './style/index.scss';

/** 带 install 方法的 EpButton，支持 app.use(EpButton) 全局注册 */
export const EpButton = Button as typeof Button & Plugin;

EpButton.install = (app: App): void => {
  app.component('EpButton', Button);
};

export default EpButton;
export * from './types';
