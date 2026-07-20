import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import { watch } from 'vue';
import { useData } from 'vitepress';
import EpCraft from 'ep-craft';

// 全量引入组件库样式（含 base 原子层 + 语义层主题）
import '../../../packages/theme/index.scss';
// 组件样式（文档全量演示，实际项目可按需引入）
import '../../../packages/components/Button/style/index.scss';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 全局注册组件库，文档 Markdown 中可直接使用 <EpButton />
    app.use(EpCraft);
  },
  setup() {
    // 将 VitePress 的暗黑状态（.dark）同步到组件库的 .ep-theme-dark / .ep-theme-light
    const { isDark } = useData();
    if (typeof document !== 'undefined') {
      const sync = (dark: boolean) => {
        const root = document.documentElement;
        root.classList.toggle('ep-theme-dark', dark);
        root.classList.toggle('ep-theme-light', !dark);
      };
      watch(isDark, sync, { immediate: true });
    }
  },
} satisfies Theme;
