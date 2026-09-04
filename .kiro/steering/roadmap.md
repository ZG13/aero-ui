# Roadmap

## Overview

重建 **aero-ui** —— 一个 AI 友好、企业级的 Vue 3 + TypeScript 组件库。它提供以 `Aero` 为前缀的可复用组件，底层是一套语义化设计 token 体系（`--aero-*`），内置国际化（zh-cn / en）、明暗主题切换、以及基于 `unplugin-vue-components` resolver 的按需导入。「AI 友好」指：确定性的编码约定 + 一份可供 AI（Claude Code / Figma MCP）精准读取的 `AI_CONTEXT.md`，让 AI 无需猜测即可生成符合规范的组件代码。另配一个 VitePress 组件文档站（中英双语镜像），每个组件独立一份文档。

## Approach Decision

- **Chosen**: 按领域拆分为多个 spec（foundation / theme / i18n / core-components / resolver / ai-friendliness / docs-site），按依赖顺序实现。
- **Why**: 每个领域可独立实现、独立评审；基础 token 迁移与暗黑模式都收敛在 `theme`；组件依赖 theme+i18n 但不依赖 resolver；AI 文档与文档站只在组件规范确立之后才沉淀。
- **Rejected alternatives**:
  - 单一大 spec —— 会产出 20+ 任务与巨大的评审面，违背增量评审。
  - 每个组件做贯穿全栈的垂直切片 —— 单切片价值更清晰，但会让 theme/i18n/resolver 基础设施被反复改动。

## Scope

- **In**: 项目脚手架与构建管线（ESM/CJS 双格式 + d.ts）；设计 token 体系（含 `base/` 迁移）；明暗主题；国际化（zh-cn/en）；3 个核心组件（Button、Input、Icon）；按需导入 resolver；`AI_CONTEXT.md` 与 AI 友好约定；VitePress 组件文档站（中英双语镜像、每组件独立文档 + markdown 内嵌示例）。
- **Out**: 3 个核心组件之外的更多组件（后续 spec）；交互式组件 playground（延迟）；SSR/水合相关问题；i18n 运行时的高级定制（仅基础集成）。

## Constraints

- Vue 3.4 + TypeScript（strict）+ Vite 5 + SCSS；pnpm workspace；Node >=18。
- 包名 `aero-ui`，组件前缀 `Aero`，CSS 变量前缀 `--aero-*`。
- 组件只能消费语义 `--aero-*` 变量，禁止引用基础色板；明暗切换用 `.aero-theme-light` / `.aero-theme-dark`。
- 仅用 `<script setup lang="ts">` + `defineProps<T>()`；props/types 放同级 `types.ts`。

## Boundary Strategy

- **Why this split**: token 迁移隔离在 `theme`，组件与文档永不接触原始文件；i18n 独立可扩展而无需改动组件；resolver 是薄薄的消费者层，只依赖组件导出契约；文档站只依赖组件导出契约与主题样式，不反向影响组件。
- **Shared seams to watch**: 组件导出契约（`packages/components/*/index.ts` 导出带 `install` 的 `AeroX`）同时被 `resolver`、`ai-friendliness` 与 `docs-site` 消费；语义 token 名（`--aero-*`）由 `theme` 与 `core-components` 共享。

## Specs (dependency order)

- [x] foundation — 项目脚手架、构建管线、工具链、路径别名、package exports。Dependencies: none
- [x] theme — 设计 token：`base/` → `packages/theme/base/` 迁移，语义 `--aero-*` 层，明暗主题。Dependencies: foundation
- [x] i18n — locale 系统（vue-i18n），zh-cn / en 字典。Dependencies: foundation
- [x] core-components — Button、Input、Icon，确立组件目录/类型/样式/测试规范。Dependencies: foundation, theme, i18n
- [x] resolver — `AeroResolver`，对接 unplugin-vue-components 按需导入。Dependencies: foundation, core-components
- [x] ai-friendliness — `AI_CONTEXT.md`、ai-doc prompt 模板、代码生成约定。Dependencies: core-components, theme, resolver
- [x] docs-site — VitePress 组件文档站，中英双语镜像，每组件独立文档 + markdown 内嵌示例。Dependencies: foundation, theme, core-components

## Phase 2 — 表单能力

- [x] form — `AeroForm`/`AeroFormItem`：表单容器与表单项，对齐 element-plus 的 model/rules/布局 API，async-validator 校验（严格类型封装），size/disabled context 传递（改造 Input 消费）。Dependencies: core-components, theme, i18n
- [x] select — `AeroSelect`/`AeroOption`：下拉选择，首个真实表单控件，落地 form 上下文契约。Dependencies: form, core-components, theme, i18n
- [x] input-number — `AeroInputNumber`：数字输入框，右侧步进按钮 + 数值逻辑（step/min/max/precision/step-strictly），消费 form 上下文。Dependencies: form, core-components, theme, i18n
- [x] date-picker — `AeroDatePicker`：日期选择框（date + daterange），日历面板 + dayjs + 通用弹层定位 `usePopper`，消费 form 上下文。Dependencies: form, core-components, theme, i18n, dayjs
- [ ] radio — `AeroRadio` / `AeroRadioGroup` / `AeroRadioButton`：单选（圆点 + 按钮样式），对齐 element-plus radio 家族 API，消费 form 上下文。Dependencies: form, core-components, theme, i18n
