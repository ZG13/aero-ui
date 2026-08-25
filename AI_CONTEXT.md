# AI_CONTEXT — aero-ui

本文件是 AI 助手（Claude Code / Figma MCP 等）生成 `aero-ui` 组件代码的**唯一全局上下文入口**。内容以既有上游契约（core-components / theme / resolver）为唯一事实来源，公共约定只在此处定义一次。若内容与上游源码不一致，以源码为准。

## 项目定位

`aero-ui` 是一个企业级 Vue 3 + TypeScript 组件库，具备以下确定性约定：

- 组件前缀：`Aero`（导出命名 PascalCase，如 `AeroButton`）。
- 设计 token：语义 CSS 变量 `--aero-*`，组件只消费语义变量，禁止硬编码与基础色板引用。
- 明暗主题：通过根类 `.aero-theme-light` / `.aero-theme-dark` 切换，默认 light。
- 国际化：内置 `zh-cn` / `en` 语言包，经 `vue-i18n` 提供运行时文案。
- 按需导入：`unplugin-vue-components` 的 `AeroResolver`，模板写 `<AeroXxx />` 即自动按需引入组件与样式。

## 导入路径

### 完整注册

```ts
import { createApp } from 'vue';
import AeroUI from 'aero-ui';

const app = createApp(App);
app.use(AeroUI); // 全局注册 AeroButton / AeroInput / AeroIcon
```

### 按需导入（unplugin-vue-components）

```ts
// vite.config.ts
import Components from 'unplugin-vue-components';
import { AeroResolver } from 'aero-ui/resolver';

export default {
  plugins: [
    Components({
      resolvers: [AeroResolver()],
    }),
  ],
};
```

配置后在模板中直接书写 `<AeroButton />`，resolver 自动生成组件 import 与逐组件样式 side effect（`importStyle: false` 可关闭样式引入）。

### 子路径导入

```ts
import AeroButton from 'aero-ui/components/button';
import AeroInput from 'aero-ui/components/input';
import AeroIcon from 'aero-ui/components/icon';
// 样式（按需模式下由 resolver 引入，手动导入时需显式引入）
import 'aero-ui/components/button/style/index.css';
```

## 组件清单

### AeroButton

| prop | 类型 | 默认值 |
|------|------|--------|
| type | `'primary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` |
| variant | `'solid' \| 'plain' \| 'none'` | `'solid'` |
| size | `'large' \| 'default' \| 'small' \| 'mini'`（36px / 32px / 28px / 24px） | `'default'` |
| shape | `'default' \| 'round'` | `'default'` |
| disabled | `boolean` | `false` |
| loading | `boolean` | `false` |
| icon | `string` | — |
| iconPosition | `'left' \| 'right'` | `'left'` |
| nativeType | `'button' \| 'submit' \| 'reset'` | `'button'` |

事件：`click`（禁用/加载中不触发）。

### AeroInput

| prop | 类型 | 默认值 |
|------|------|--------|
| modelValue | `string \| number` | — |
| placeholder | `string` | — |
| disabled | `boolean` | `false` |
| clearable | `boolean` | `false` |
| size | `'large' \| 'main' \| 'small'` | `'main'` |

事件：`update:modelValue` / `input` / `change`（失焦触发）/ `focus` / `blur` / `clear`。

### AeroIcon

| prop | 类型 | 默认值 |
|------|------|--------|
| name | `string`（内置 `loading` / `close` / `search`） | — |
| size | `number \| string` | `'1em'` |
| color | `string` | `'currentColor'` |

未知 `name` 渲染为空内容，不抛错。

## 设计 token 变量

### 品牌色（各 1–10 阶，跨模式不变）

`--aero-primary-*`、`--aero-success-*`、`--aero-warning-*`、`--aero-danger-*`、`--aero-link-*`

### 中性色（明暗反转）

- 文本 `--aero-text-*`：`main` / `secondary` / `tertiary` / `disabled` / `inverse`
- 背景 `--aero-bg-*`：`main` / `subtle`
- 边框 `--aero-border-*`：`main` / `light`
- 填充 `--aero-fill-*`：`main` / `light`

### 非颜色语义（跨模式一致）

- 圆角 `--aero-radius-*`：`small` / `main` / `large` / `full`
- 间距 `--aero-space-*`：`0` / `05` / `1` / `2` / `3` / `4` / `6` / `8` / `10` / `12` / `14` / `16` / `20` / `24` / `28` / `32` / `36` / `40` / `48` / `56` / `60` / `full`
- 字体 `--aero-font-family-*`：`number` / `chinese` / `english`
- 排版 `--aero-typography-*`：`size-*` / `line-height-*` / `weight-*`
- 透明度 `--aero-opacity-*`：`zero` / `disabled` / `dimmer` / `overlay` / `main` / `backdrop`
- 描边 `--aero-stroke-*`：`0`–`4`
- 内边距 `--aero-insets-*`：`0` / `2` / `4` / `8` / `12` / `16` / `20` / `24`

### 明暗切换

根 `<html>` 元素挂 `.aero-theme-light`（默认，与 `:root` 一致）或 `.aero-theme-dark` 切换明暗。

## 代码生成规则

- **SFC 形态**：使用 `<script setup lang="ts">` + `defineProps<T>()`（含 `withDefaults`）+ `defineEmits<T>()`，禁用 Options API。
- **类型承载**：组件 props / emits 类型定义在同级 `types.ts` 中并导出，供消费者依赖；遵循 TypeScript `strict`，禁用 `any`。
- **DOM 类名**：BEM 命名（如 `aero-button`、`aero-button__loading`、状态修饰符 `is-loading` / `is-disabled`）。
- **样式消费**：组件样式只引用 `--aero-*` 语义变量，禁止硬编码颜色/间距/圆角，禁止直接引用基础色板。
- **目录结构**：「一个组件一个文件夹」：

```
packages/components/<name>/
  index.ts          # 导出带 install 的 AeroXxx + 再导出 types
  src/Xxx.vue       # <script setup lang="ts"> 实现
  style/index.scss  # BEM 类 + --aero-* token
  types.ts          # Props / Emits 接口（JSDoc @default）
  __tests__/Xxx.test.ts
```

## 禁用 API 清单

生成代码时**禁止**出现以下任何一项：

- ❌ `--ep-*` 变量（过时命名，统一使用 `--aero-*`）。
- ❌ `.dark` 主题类（明暗只用 `.aero-theme-light` / `.aero-theme-dark`）。
- ❌ Options API（`export default { props, data, methods }` 形式）。
- ❌ 硬编码视觉值（颜色 / 间距 / 圆角等字面量，只允许出现在基础 token 定义内）。
- ❌ 直接引用基础色板（如 `--aero-blue-*` 或 SCSS `$blue-*`）。
- ❌ `any` 类型。
- ❌ 外部图标库（图标使用内置 `AeroIcon`）。
