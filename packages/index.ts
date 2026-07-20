import type { App, Plugin } from 'vue';
import { EpButton } from './components';

/** 所有组件列表（用于全量注册） */
const components: Plugin[] = [EpButton];

/** 全量安装：app.use(EpCraft) */
const install = (app: App): void => {
  components.forEach((c) => app.use(c));
};

export default { install };

// 具名导出组件
export * from './components';

// 导出 hooks 与国际化能力
export * from './hooks';
export * from './locale';

export const version = '0.1.0';
