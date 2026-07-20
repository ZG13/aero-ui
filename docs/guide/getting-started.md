# 快速开始

## 安装

```bash
pnpm add ep-craft
```

## 全量引入

```ts
import { createApp } from 'vue';
import EpCraft from 'ep-craft';
import 'ep-craft/theme/index.css';
import App from './App.vue';

createApp(App).use(EpCraft).mount('#app');
```

## 按需引入（推荐）

在 `vite.config.ts` 中配置 `unplugin-vue-components` 与 `EpCraftResolver`：

```ts
import Components from 'unplugin-vue-components/vite';
import { EpCraftResolver } from 'ep-craft/resolver';

export default {
  plugins: [
    Components({
      resolvers: [EpCraftResolver()],
    }),
  ],
};
```

配置后模板中直接使用组件，无需手动 import，组件及其样式会被自动引入：

```vue
<template>
  <EpButton type="primary">按钮</EpButton>
</template>
```

## 单组件引入

```ts
import { EpButton } from 'ep-craft';
import 'ep-craft/components/button/style';
```
