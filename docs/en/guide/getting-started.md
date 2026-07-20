# Getting Started

## Installation

```bash
pnpm add ep-craft
```

## Full Import

```ts
import { createApp } from 'vue';
import EpCraft from 'ep-craft';
import 'ep-craft/theme/index.css';
import App from './App.vue';

createApp(App).use(EpCraft).mount('#app');
```

## On-demand Import (recommended)

Configure `unplugin-vue-components` with `EpCraftResolver` in `vite.config.ts`:

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

Then use components directly in templates — the component and its styles are imported automatically:

```vue
<template>
  <EpButton type="primary">Button</EpButton>
</template>
```

## Single Component Import

```ts
import { EpButton } from 'ep-craft';
import 'ep-craft/components/button/style';
```
