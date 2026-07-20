# 介绍

`ep-craft` 是一个基于 **Vue 3 + TypeScript + Vite** 构建的企业级 Web 端组件库。

## 特性

- **类型优先**：所有 Props / Emits / Slots 使用 `defineProps<T>()` 泛型声明，并单独导出 `types.ts` 接口。
- **按需引入**：Vite `build.lib` + Rollup `preserveModules` 保留模块结构，配合 `sideEffects` 与子路径 `exports` 实现 tree-shaking。
- **暗黑模式**：两级 Design Token（基础层 `--ep-blue-6` + 语义层 `--ep-primary-6`），通过 `.ep-theme-light` / `.ep-theme-dark` 切换。
- **国际化**：内置 `useLocale` Hook 与中英文语言包。

## 设计令牌

组件内部只引用**语义层** CSS 变量（如 `var(--ep-primary-6)`、`var(--ep-text-main)`），语义层再引用基础层原子值，禁止硬编码色值。
