---
layout: home

hero:
  name: ep-craft
  text: 企业级 Vue 3 组件库
  tagline: 类型优先 · 按需引入 · 暗黑模式 · 国际化
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 组件
      link: /components/button

features:
  - title: 类型优先
    details: 所有组件基于 defineProps<T>() 泛型声明并导出接口，VSCode 提供精准类型提示。
  - title: 按需引入
    details: preserveModules 保留模块结构打包，配合 EpCraftResolver 自动引入组件与样式。
  - title: 主题与国际化
    details: 两级 Design Token + 暗黑模式，内置 useLocale / useTheme，支持中英文切换。
---
