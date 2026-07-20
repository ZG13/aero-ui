# AI_CONTEXT — ep-craft 组件库

> 本文件供 AI（Claude Code / Figma MCP）阅读，用于精准调取与生成 `ep-craft` 组件库代码。

## 包信息

- 包名：`ep-craft`
- 组件前缀：`Ep`（如 `EpButton`）
- 技术栈：Vue 3 + TypeScript + Vite + SCSS

## 导入路径规范

```ts
// 全量 / 具名引入
import { EpButton } from 'ep-craft';
import 'ep-craft/theme/index.css';

// 按需子路径引入
import EpButton from 'ep-craft/components/button';
import 'ep-craft/components/button/style/index.css';

// 全局注册
import EpCraft from 'ep-craft';
app.use(EpCraft);
```

自动按需（推荐）：配置 `unplugin-vue-components` + `EpCraftResolver`，模板中直接写 `<EpButton />`。

## 组件清单

| 组件 | 标签 | 描述 |
| --- | --- | --- |
| Button | `<EpButton>` | 通用按钮，支持 type/size/variant/icon/loading/disabled |

### EpButton Props

- `type`: `primary` \| `success` \| `danger` \| `warning` \| `info`（默认 `primary`）
- `size`: `mini` \| `small` \| `middle` \| `large`（默认 `middle`）
- `variant`: `solid` \| `plain` \| `none`（默认 `solid`）
- `round` / `disabled` / `loading`: `boolean`
- `icon` / `suffixIcon`: `string`
- `nativeType`: `button` \| `submit` \| `reset`
- Emits: `click(event: MouseEvent)`

## 设计系统核心变量（语义层，仅可用这一层）

| 用途 | 变量 |
| --- | --- |
| 主色 | `--ep-primary-6`（hover `-5`，active `-7`） |
| 成功/危险/警告 | `--ep-success-main` / `--ep-danger-main` / `--ep-warning-main`（配 `-hover` / `-clicked`） |
| 文字 | `--ep-text-main` / `--ep-text-secondary` / `--ep-text-white` |
| 边框 | `--ep-border-main` / `--ep-stroke-main` |
| 圆角 | `--ep-radius-main` / `--ep-radius-full` |
| 反馈底色 | `--ep-feedback-hover` / `--ep-feedback-active` |

## 代码生成规则（务必遵守）

1. 优先复用已有组件（`EpButton` 等），禁止用原生 `div`/`button` 重复造轮子。
2. 组件内**禁止硬编码颜色/间距**，只能用 `--ep-*` 语义层变量；禁止直接引用基础色板（如 `--ep-blue-6`）。
3. 明暗模式通过根节点 `.ep-theme-light` / `.ep-theme-dark` 切换，勿使用 `.dark`。
4. 组件用 `<script setup lang="ts">` + `defineProps<T>()`，接口单独放 `types.ts`。

## 禁止使用的过时 API

- ❌ `.dark` 类切换主题 → ✅ `.ep-theme-dark`
- ❌ `--ui-*` 变量前缀 → ✅ `--ep-*`
- ❌ Options API / `export default { props }` → ✅ `<script setup>` + `defineProps<T>()`
