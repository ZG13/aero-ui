# Introduction

`ep-craft` is an enterprise-grade web component library built with **Vue 3 + TypeScript + Vite**.

## Features

- **Type-first**: All Props / Emits / Slots are declared with `defineProps<T>()` generics and exported from `types.ts`.
- **Tree-shakable**: Vite `build.lib` + Rollup `preserveModules` keep the module structure; `sideEffects` and subpath `exports` enable tree-shaking.
- **Dark mode**: Two-level design tokens (base `--ep-blue-6` + semantic `--ep-primary-6`), toggled via `.ep-theme-light` / `.ep-theme-dark`.
- **i18n**: Built-in `useLocale` hook with Chinese / English language packs.

## Design Tokens

Components only reference **semantic** CSS variables (e.g. `var(--ep-primary-6)`, `var(--ep-text-main)`), which reference base atomic values. Hard-coded colors are forbidden.
