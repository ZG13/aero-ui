import { defineConfig } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'ep-craft',
  description: '企业级 Vue 3 组件库',

  // 让文档站点能解析组件库源码，实现实时示例
  vite: {
    resolve: {
      alias: {
        'ep-craft': fileURLToPath(new URL('../../packages/index.ts', import.meta.url)),
      },
    },
  },

  // 中英文双语言路由
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/introduction' },
          { text: '组件', link: '/components/button' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: '指南',
              items: [
                { text: '介绍', link: '/guide/introduction' },
                { text: '快速开始', link: '/guide/getting-started' },
              ],
            },
          ],
          '/components/': [
            {
              text: '基础组件',
              items: [{ text: 'Button 按钮', link: '/components/button' }],
            },
          ],
        },
        docFooter: { prev: '上一页', next: '下一页' },
        darkModeSwitchLabel: '外观',
        returnToTopLabel: '返回顶部',
        outline: { label: '本页目录' },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/introduction' },
          { text: 'Components', link: '/en/components/button' },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Introduction', link: '/en/guide/introduction' },
                { text: 'Getting Started', link: '/en/guide/getting-started' },
              ],
            },
          ],
          '/en/components/': [
            {
              text: 'Basic',
              items: [{ text: 'Button', link: '/en/components/button' }],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/' }],
    search: { provider: 'local' },
  },
});
