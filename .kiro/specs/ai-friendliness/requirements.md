# Requirements Document

## Introduction

本规范（ai-friendliness）为 `aero-ui` 组件库确立「AI 友好」能力：采用「约定 + AI_CONTEXT.md」轻量方案，重写根目录 `AI_CONTEXT.md`（迁移为 aero-ui / Aero / `--aero-*` 命名），并在 `ai-doc/` 下沉淀组件级 prompt 模板与初始化说明。目标受众是 AI 助手（Claude Code / Figma MCP）与借助 AI 的组件库开发者，使其无需猜测即可生成符合规范的组件代码。本规范只产出文档与 prompt 模板，不引入运行时组件元数据注册或自动化文档生成器。

## Boundary Context (Optional)

- **In scope**：根目录 `AI_CONTEXT.md`（含导入路径、组件清单、设计 token 变量、代码生成规则、禁用 API 清单）；`ai-doc/`（组件级 prompt 模板与初始化说明）。
- **Out of scope**：组件实现（属 core-components）；主题 token 定义与迁移（属 theme）；i18n 机制（属 i18n）；resolver 实现（属 resolver）；运行时组件元数据注册；自动化文档生成器；VitePress 文档站（属 docs-site）。
- **Adjacent expectations**：`core-components` 已确立组件目录/导出契约与 `AeroButton` / `AeroInput` / `AeroIcon` 的 props / emits 类型；`theme` 已确立 `--aero-*` 语义变量与 `.aero-theme-light` / `.aero-theme-dark` 明暗类；`resolver` 确立 `AeroResolver` 与 `<AeroX />` → `aero-ui/components/x` 的按需导入用法。本规范只消费这些契约作为文档内容来源，不修改它们。

## Requirements

### Requirement 1: AI_CONTEXT.md 全局上下文
**Objective:** As a AI 助手（Claude Code / Figma MCP），I want 一份精确、确定的 `AI_CONTEXT.md` 全局上下文，so that 无需猜测即可获取组件库的导入方式、组件清单、设计 token 与编码约定。

#### Acceptance Criteria
1.1 The AI_CONTEXT.md shall 采用 aero-ui / Aero / `--aero-*` 命名，不出现 `--ep-*`、`.dark` 等过时 API。

1.2 The AI_CONTEXT.md shall 包含组件导入路径说明，覆盖完整注册（`app.use`）、按需导入（`AeroResolver` + `<AeroX />`）与子路径导入（`aero-ui/components/x`）。

1.3 The AI_CONTEXT.md shall 包含组件清单，列出 `AeroButton`、`AeroInput`、`AeroIcon` 及其 props / emits 契约要点。

1.4 The AI_CONTEXT.md shall 包含设计 token 变量说明，覆盖 `--aero-*` 语义变量的类别与命名约定（品牌色、中性色、非颜色语义）。

1.5 The AI_CONTEXT.md shall 内容与上游 core-components / theme / resolver 契约保持一致，不含过时或臆造的 API。

### Requirement 2: 代码生成规则
**Objective:** As a AI 助手，I want 确定性的代码生成规则，so that 生成的组件代码符合 `<script setup>`、类型安全、BEM 命名与 `--aero-*` 消费等约定。

#### Acceptance Criteria
2.1 The AI_CONTEXT.md shall 提供代码生成规则，规定使用 `<script setup lang="ts">` + `defineProps<T>()`（含 `withDefaults`）+ `defineEmits<T>()`，禁用 Options API。

2.2 The AI_CONTEXT.md shall 规定组件 props / emits 类型放在同级 `types.ts` 中，且类型遵循 TypeScript strict 模式、禁用 `any`。

2.3 The AI_CONTEXT.md shall 规定组件 DOM 类名采用 BEM（`aero-*`）命名，样式只消费 `--aero-*` 语义变量。

2.4 The AI_CONTEXT.md shall 规定「一个组件一个文件夹」目录结构（`index.ts` / `src/Xxx.vue` / `style/index.scss` / `types.ts` / `__tests__/`）。

### Requirement 3: 禁用 API 清单
**Objective:** As a AI 助手，I want 一份明确的禁用 API 清单，so that 生成代码时主动避开过时或越界用法。

#### Acceptance Criteria
3.1 The AI_CONTEXT.md shall 提供禁用 API 清单，禁止 `--ep-*` 变量、`.dark` 主题类与 Options API。

3.2 The AI_CONTEXT.md shall 禁止硬编码视觉值（颜色/间距/圆角）与直接引用基础色板（如 `--aero-blue-*` 或 SCSS `$blue-*`）。

3.3 If AI 生成代码遵循该清单，the 生成的代码 shall 不包含任何禁用项。

### Requirement 4: ai-doc 组件级 prompt 模板
**Objective:** As a AI 助手，I want 每个核心组件都有对应的 prompt 模板，so that 生成该组件或其同类组件时可直接套用规范化的提示词。

#### Acceptance Criteria
4.1 The ai-doc 目录 shall 为 `AeroButton`、`AeroInput`、`AeroIcon` 各提供一份组件级 prompt 模板。

4.2 The 每个组件 prompt 模板 shall 包含该组件的 props / emits 契约、`--aero-*` token 用法与代码生成规则。

4.3 The 每个组件 prompt 模板 shall 与 `AI_CONTEXT.md` 及上游 core-components 契约保持一致。

### Requirement 5: ai-doc 初始化说明
**Objective:** As a AI 助手，I want 一份初始化说明，so that 明确如何加载 `AI_CONTEXT.md` 与选用组件 prompt 模板。

#### Acceptance Criteria
5.1 The ai-doc 目录 shall 提供初始化说明（init），指导 AI 如何读取 `AI_CONTEXT.md` 并选择组件 prompt 模板。

5.2 The 初始化说明 shall 覆盖 Claude Code 与 Figma MCP 两种使用方式。

### Requirement 6: 轻量方案范围约束
**Objective:** As a 组件库维护者，I want 本特性只产出文档与 prompt 模板，so that 不引入运行时开销与维护负担。

#### Acceptance Criteria
6.1 The 本规范 shall 只产出 `AI_CONTEXT.md` 与 `ai-doc/` 文档，不引入运行时组件元数据注册。

6.2 The 本规范 shall 不引入自动化文档生成器或构建期代码扫描工具。
