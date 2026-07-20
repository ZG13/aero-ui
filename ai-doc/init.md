# Vue 3 组件库搭建完全指南（Claude Code 专用提示词）

请作为资深前端架构师，严格遵循以下指令，使用 Vite + Vue 3 + TypeScript 从零搭建一个企业级 Web 端组件库。所有代码必须符合生产级标准，具备高可维护性和 AI 友好性。请以 Markdown 格式输出完整的项目搭建方案、核心代码及配置文件。

## 〇、全局约定（AI 必读）

在生成任何代码前，必须严格遵守以下统一约定，禁止随意变更：

### 0.1 命名规范

- **包名**：`ep-craft`。
- **组件标签前缀**：`Ep`（如 `EpButton`、`EpInput`、`EpDialog`）。
- **CSS 变量前缀**：统一使用 `--ep-`（如 `--ep-primary-6`、`--ep-text-main`、`--ep-radius-main`）。全文禁止出现 `--ui-` 等其他前缀。
- **组件 class 前缀 (BEM)**：`ep-`（如 `.ep-button`、`.ep-button--primary`、`.ep-button.is-disabled`）。
- **主题类名**：亮/暗模式通过 `.ep-theme-light` / `.ep-theme-dark` 类名切换（配合 `page` 选择器），禁止使用 `.dark` 等其他类名。
- **Design Token 命名**：采用「基础层 + 语义层」两级命名。
  - 基础层（原子值，位于 `base/`）：`{category}-{scale}`，如 `--ep-blue-6`、`--ep-n-8`。
  - 语义层（业务语义，位于 `light.scss`/`dark.scss`）：`{category}-{semantic}`，如 `--ep-primary-6`、`--ep-text-main`、`--ep-radius-main`、`--ep-spacing-tight`、`--ep-stroke-main`。
  - 语义层必须引用基础层变量（如 `--ep-primary-6: var(--ep-blue-6)`），组件只允许使用语义层变量。

### 0.2 环境与版本要求

| 依赖 | 版本要求 |
| --- | --- |
| Node.js | >= 18.0.0 |
| pnpm | >= 8.0.0 |
| Vue | ^3.4.0 |
| TypeScript | ^5.3.0 |
| Vite | ^5.0.0 |
| vue-i18n | ^9.0.0 |
| sass | ^1.70.0 |

### 0.3 组件清单（首批实现范围）

- **基础**：Button。

> Button 必须遵循第 2.1 节编写规范，并配套 `types.ts`、`index.ts`、单元测试与文档。后续组件（Input、Dialog、Row/Col 等）按相同规范逐步扩展。

## 一、项目基础架构与技术栈

### 1.1 项目初始化

- 使用 pnpm 作为包管理器（开启 workspace 模式，隔离文档与组件库源码）。
- 使用 Vite 作为构建工具，需同时支持 ES Module 和 CommonJS 格式的打包输出。
- TypeScript 配置：开启 strict 模式，必须生成 `.d.ts` 类型声明文件。

### 1.2 目录结构规范

请按以下结构创建目录：

```text
ep-craft/
├── packages/                    # 组件库核心
│   ├── components/              # 组件源码
│   │   ├── Button/
│   │   │   ├── src/
│   │   │   │   └── Button.vue
│   │   │   ├── __tests__/
│   │   │   │   └── Button.test.ts
│   │   │   ├── style/          # 组件独立样式（支持按需加载）
│   │   │   │   └── index.css
│   │   │   ├── index.ts        # 导出组件 & 类型
│   │   │   └── types.ts        # 组件专用 TypeScript 接口
│   │   └── index.ts            # 全量导出所有组件
│   ├── theme/                  # 主题变量 (CSS Variables / SCSS)
│   │   ├── base/               # 基础层原子 Token
│   │   │   ├── color.scss      # 色板（--ep-blue-6 等）
│   │   │   ├── number.scss     # 数值基准（--ep-n-8 等）
│   │   │   ├── font.scss       # 字重
│   │   │   ├── opacity.scss    # 透明度
│   │   │   ├── radius.scss     # 圆角
│   │   │   ├── insets.scss     # 间距/内边距
│   │   │   ├── stroke.scss     # 边框线宽
│   │   │   ├── typography.scss # 排版
│   │   │   └── index.scss      # 聚合导出基础层
│   │   ├── light.scss          # 亮色语义变量 (light-theme-vars mixin)
│   │   ├── dark.scss           # 暗色语义变量 (dark-theme-vars mixin)
│   │   └── index.scss          # 主题入口（挂载 .ep-theme-light/.ep-theme-dark）
│   ├── hooks/                  # 组合式函数
│   ├── locale/                 # 国际化语言包
│   │   ├── lang/
│   │   │   ├── en.ts
│   │   │   └── zh-cn.ts
│   │   └── index.ts
│   ├── resolver/               # 按需引入 Resolver (unplugin-vue-components)
│   │   └── index.ts
│   └── index.ts                # 库主入口
├── docs/                       # 文档站点
│   ├── .vitepress/
│   │   ├── config.ts           # VitePress 配置（含 i18n 和暗黑模式）
│   │   └── theme/
│   │       └── index.ts        # 自定义主题（切换暗黑/国际化的UI入口）
│   ├── guide/                  # 指南文档
│   ├── components/             # 组件 API 文档 (.md)
│   └── index.md
├── package.json
├── tsconfig.json
├── vite.config.ts              # Vite 主配置（含 lib 模式打包）
└── .eslintrc.cjs
```

## 二、组件库核心功能实现要求

### 2.1 组件编写规范 (AI 可读性核心)

为了让 AI（Claude Code / Figma MCP）能完美阅读和使用组件，必须遵循：

- **类型优先**：所有 Props、Emits、Slots 必须使用 `defineProps<T>()` 泛型声明，并单独导出 `types.ts` 中的接口。
- **JSDoc 注释**：每个 Prop 必须附带 JSDoc 注释，说明用途和默认值。
- **组合式 API**：必须使用 `<script setup lang="ts">`。

示例代码要求：

```vue
<script setup lang="ts">
import type { ButtonProps } from './types';

/**
 * Button 组件通用按钮
 * @description 用于触发操作，支持多种主题和尺寸
 */
const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>
```

### 2.2 暗黑模式切换 (主题系统)

- **实现方式**：使用 SCSS + CSS Variables 两级 Token。基础层原子值定义在 `theme/base/`；语义层用 SCSS mixin（`light-theme-vars` / `dark-theme-vars`）在 `light.scss` / `dark.scss` 中定义，再由 `theme/index.scss` 分别挂载到 `.ep-theme-light` / `.ep-theme-dark`（配合 `page` 选择器）下。
- **切换逻辑**：封装 `useTheme` Hook，利用 VueUse 的 `useDark` 和 `useToggle`，切换根节点的 `.ep-theme-light` / `.ep-theme-dark` 类名，并将状态持久化到 localStorage。
- **要求**：组件内部绝对禁止硬编码颜色值，也禁止直接引用基础层色板；必须引用语义层 CSS 变量（如 `var(--ep-primary-6)`、`var(--ep-text-main)`、`var(--ep-border-main)`）。

亮色语义变量示例（`light.scss`）：

```scss
@mixin light-theme-vars {
  /* 主色（引用基础层色板） */
  --ep-primary-6: var(--ep-blue-6);
  /* 文字 */
  --ep-text-main: var(--ep-coolgrey-10);
  --ep-text-secondary: var(--ep-coolgrey-8);
  /* 边框 */
  --ep-border-main: var(--ep-coolgrey-3);
}
```

### 2.3 国际化 (i18n) 实现

- 使用 `vue-i18n@next`。
- 在组件库内部，通过 provide/inject 或直接导出 `useLocale` Hook 获取当前语言包。
- 语言包需包含组件内置文字（如：分页的“上一页”、“下一页”，空状态的“暂无数据”）。
- **切换逻辑**：文档头部提供中/英切换按钮，切换时更新全局 locale 状态，组件重新渲染文字。

### 2.4 构建与导出方式 (参考 Element Plus)

- **导出格式**：同时输出 ESM (`.mjs`) 和 CJS (`.cjs`)。
- **类型文件**：在 `package.json` 中配置 `"types"` 指向合并后的 `index.d.ts`。

### 2.5 按需引入 (Tree-shaking) 设计

组件库必须原生支持按需引入，用户仅打包实际用到的组件与样式。核心设计要求：

- **保留模块结构打包**：Vite 打包时开启 `build.lib` + Rollup `output.preserveModules`，以组件为粒度输出，避免全部打进单文件，保证 tree-shaking 生效。
- **无副作用声明**：`package.json` 配置 `"sideEffects"`，仅将样式文件（`*.css`）标记为有副作用，其余 JS 模块声明为无副作用，允许打包器摇树。
- **子路径导出 (`exports`)**：`package.json` 必须配置 `"exports"` 字段，映射主入口与各组件子路径，允许用户导入 `ep-craft/components/button` 等子路径，并区分 `import`(ESM) / `require`(CJS) / `types` 条件。

示例 `exports` 配置：

```json
{
  "sideEffects": [
    "**/*.css"
  ],
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/es/index.mjs",
      "require": "./dist/lib/index.cjs"
    },
    "./components/*": {
      "types": "./dist/types/components/*/index.d.ts",
      "import": "./dist/es/components/*/index.mjs",
      "require": "./dist/lib/components/*/index.cjs"
    },
    "./theme/*": "./dist/theme/*",
    "./package.json": "./package.json"
  }
}
```

### 2.6 样式的按需加载

- **样式分离打包**：每个组件的样式单独产出对应 CSS 文件（如 `dist/es/components/button/style.css`），并提供由 `theme/index.scss` 编译而来的全量样式 `ep-craft/theme/index.css`。
- **两种使用方式**：
  - 全量引入：`import 'ep-craft/theme/index.css'`。
  - 按需引入：借助自动导入插件按组件加载对应样式。
- **自动按需插件支持**：提供 `unplugin-vue-components` 的 Resolver，用户在 `vite.config.ts` 中配置后，模板中直接使用 `<EpButton />` 即可自动引入组件及其样式，无需手动 import。

用户侧自动按需配置示例：

```ts
// vite.config.ts
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

## 三、工程化与质量保障

### 3.1 代码规范

- 使用 ESLint（`eslint-plugin-vue` + `@typescript-eslint`）+ Prettier 统一风格，提交前通过 `simple-git-hooks` + `lint-staged` 自动校验。
- 全量类型检查：`vue-tsc --noEmit` 必须零错误。

### 3.2 单元测试

- 使用 Vitest + `@vue/test-utils` + `jsdom`，每个组件在 `__tests__/` 下编写测试。
- 覆盖：Props 渲染、事件触发（emit）、Slots、禁用/加载等边界状态。
- 关键组件行分支覆盖率目标 ≥ 80%。

### 3.3 无障碍 (a11y) 与 SSR

- **a11y**：交互组件必须补充 `role`、`aria-*`、键盘可达（Tab/Enter/Esc），焦点态可见。
- **SSR 兼容**：组件内禁止在模块顶层直接访问 `window`/`document`，需放入 `onMounted` 或做环境判断，保证 Nuxt/SSR 下可用。

## 五、VitePress 文档站点配置要求

### 5.1 文档与演示

- 使用 vitepress 搭建文档。
- 在 `docs/.vitepress/config.ts` 中配置中英文双语言路由 (locales)。
- 所有组件 API 文档必须使用 Markdown 编写，并嵌入实时交互示例（使用 vitepress 的 liveDemo 或 markdown 中的 Vue 组件渲染）。

### 5.2 文档中的暗黑与国际化联动

- VitePress 默认支持暗黑模式，需确保自定义主题样式与 VitePress 默认主题的暗黑变量完美融合，无闪烁。
- 国际化的页面文案（侧边栏、导航栏）必须在 `config.ts` 中通过 `themeConfig` 的 `locales` 字段配置完毕。

## 六、针对 AI 与 Figma MCP 的专项设计指导

为了支持 Figma MCP 设计生成代码并让 AI 精准调取组件库：

### 6.1 设计令牌 (Design Tokens) 映射

- 在 `packages/theme` 中导出一个 `design-tokens.json`，包含颜色、间距、圆角、字体等变量，与 `base/` 原子层及 `light.scss`/`dark.scss` 语义层保持一一对应。
- **提示词要求**：Figma MCP 生成的代码中，必须将 Figma 颜色变量映射为组件库的**语义层** CSS 变量（例如 `figma.color.primary` -> `var(--ep-primary-6)`，`figma.color.text` -> `var(--ep-text-main)`），禁止映射到基础层色板或硬编码色值。

### 6.2 组件库上下文文档

在项目根目录创建 `AI_CONTEXT.md`，专门用于给 AI 阅读。内容需包含：

- 所有组件的简短描述。
- 组件的导入路径规范（`import { Button } from 'ep-craft'`）。
- 禁止使用的过时 API 列表。
- 设计系统的核心变量对照表。

### 6.3 代码生成规则

- 当 AI（Claude Code）收到 Figma 设计稿代码时，必须优先查找组件库中已有的基础组件（Button, Input, Dialog 等），禁止重复造轮子生成原生 `div`。
- 对于复杂布局，AI 应直接组合组件库中的布局组件（如 `Row` / `Col`）。

## 七、具体的实施步骤与配置代码清单

请 Claude Code 按顺序执行以下任务，并提供所有文件的完整代码：

1. **初始化项目**：给出 `package.json`、`tsconfig.json`、`pnpm-workspace.yaml` 的配置。
2. **编写 Vite 配置**：`vite.config.ts` 需包含 `build.lib` 配置，开启 `preserveModules` 以支持按需引入，并利用 `vite-plugin-dts` 生成类型文件。
3. **实现示例组件（Button）**：提供包含完整注释的 `Button.vue`、`types.ts` 和 `index.ts`。
4. **实现主题切换**：提供 `base/` 原子 Token 与 `light.scss` / `dark.scss` 语义变量（`light-theme-vars`/`dark-theme-vars` mixin）的核心定义，以及切换 `.ep-theme-light`/`.ep-theme-dark` 的 `useTheme` Hook。
5. **实现国际化**：提供 locale 核心代码，包括 `useLocale` Hook 和 `zh-cn.ts` / `en.ts` 语言包示例。
6. **实现按需引入**：配置 `package.json` 的 `exports` 与 `sideEffects`，并提供 `unplugin-vue-components` 的 `EpCraftResolver`。
7. **补充工程化配置**：ESLint、Prettier、Vitest 配置及 Button 单元测试示例。
8. **配置 VitePress**：提供完整的 `config.ts`（含 i18n 配置），并在文档中引入组件库进行预览。
9. **生成 AI 上下文文档**：生成上述 `AI_CONTEXT.md` 文件模板。

## 八、交付质量标准

- [ ] 运行 `pnpm build` 能够正确输出 dist 目录，包含 es 和 lib 两种格式。
- [ ] 运行 `pnpm docs:build` 能够生成包含中英文切换和暗黑模式的静态文档站点。
- [ ] 运行 `pnpm lint` 与 `pnpm typecheck`（`vue-tsc --noEmit`）零错误。
- [ ] 运行 `pnpm test` 全部单元测试通过，关键组件覆盖率 ≥ 80%。
- [ ] 外部项目通过 `npm link` 或 `pnpm add` 安装后，能够使用 `import { Button } from 'ep-craft'` 或 `import Button from 'ep-craft/components/button'` 正确导入组件，且 VSCode 能给出准确的类型提示。
- [ ] 按需引入生效：仅引入单个组件时，最终打包产物不包含其他未使用组件的代码与样式（tree-shaking 成功）。
- [ ] 配置 `EpCraftResolver` 后，模板中直接使用组件即可自动引入组件及其对应样式，无需手动 import。
- [ ] 切换暗黑模式时（`.ep-theme-light` ↔ `.ep-theme-dark`），所有语义层 CSS 变量平滑过渡，无样式错乱。
- [ ] 语言包切换时，组件内置文字（如弹窗的“确定/取消”）同步刷新。
