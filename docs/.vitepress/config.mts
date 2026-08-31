import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

// aero-ui 源码别名：文档站 dev 阶段直接从源码消费组件与主题，无需先构建 dist。
// foundation 已建立 `aero-ui` / `aero-ui/*` 别名契约，这里在 VitePress 侧声明解析映射。
const packagesRoot = fileURLToPath(new URL('../../packages', import.meta.url))

export default defineConfig({
  // 默认语言 zh-CN（无 root locale 时作为回退 lang）
  lang: 'zh-CN',
  title: 'Aero UI',
  description: 'AI 友好的企业级 Vue 3 组件库',

  // 禁用 VitePress 默认 .dark 外观；明暗切换由自定义 ThemeSwitch 切 .aero-theme-* 根类实现。
  appearance: false,

  locales: {
    'zh-CN': {
      lang: 'zh-CN',
      label: '中文',
      title: 'Aero UI',
      description: 'AI 友好的企业级 Vue 3 组件库',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh-CN/' },
          { text: '组件', link: '/zh-CN/components/button', activeMatch: '/zh-CN/components/' }
        ],
        sidebar: {
          '/zh-CN/components/': [
            {
              text: '组件',
              items: [
                { text: 'Button 按钮', link: '/zh-CN/components/button' },
                { text: 'Input 输入框', link: '/zh-CN/components/input' },
                { text: 'Icon 图标', link: '/zh-CN/components/icon' },
                { text: 'Form 表单', link: '/zh-CN/components/form' }
              ]
            }
          ]
        }
      }
    },
    'en-US': {
      lang: 'en-US',
      label: 'English',
      title: 'Aero UI',
      description: 'AI-friendly enterprise Vue 3 component library',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en-US/' },
          { text: 'Components', link: '/en-US/components/button', activeMatch: '/en-US/components/' }
        ],
        sidebar: {
          '/en-US/components/': [
            {
              text: 'Components',
              items: [
                { text: 'Button', link: '/en-US/components/button' },
                { text: 'Input', link: '/en-US/components/input' },
                { text: 'Icon', link: '/en-US/components/icon' },
                { text: 'Form', link: '/en-US/components/form' }
              ]
            }
          ]
        }
      }
    }
  },

  vite: {
    resolve: {
      alias: [
        // 注意：字符串 find 会被 Vite 当作前缀匹配，须用正则做精确匹配，
        // 否则 `aero-ui/components/*` 会被错误解析为 `packages/index.ts/components/*`。
        { find: /^aero-ui$/, replacement: `${packagesRoot}/index.ts` },
        { find: /^aero-ui\/(.*)$/, replacement: `${packagesRoot}/$1` }
      ]
    }
  },

  markdown: {
    config(md) {
      // 将 ```vue 代码块转换为实时演示：把源码 base64 后交给全局 <DemoBlock> 组件，
      // 由其运行时编译渲染（element-plus 风格的「效果 + 源码」展示）。
      const renderFence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token.info.trim() === 'vue') {
          // 源码 + 用 VitePress 自带 shiki 高亮后的 HTML，均 base64 编码传入，
          // 使 <DemoBlock> 的「显示代码」区获得与站内代码块一致的高亮与明暗配色。
          const source = Buffer.from(token.content, 'utf8').toString('base64')
          const highlighted =
            options.highlight?.(token.content, 'vue', '') || md.utils.escapeHtml(token.content)
          const html = Buffer.from(highlighted, 'utf8').toString('base64')
          return `<DemoBlock source="${source}" html="${html}" />\n`
        }
        return renderFence(tokens, idx, options, env, self)
      }
    }
  }
})
