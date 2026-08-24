# Requirements Document

## Introduction

本规范（core-components）的目标是重建 `aero-ui` 组件库的核心组件层：实现 `AeroButton`、`AeroInput`、`AeroIcon` 三个可复用组件，并确立「一个组件一个文件夹」的组件编写规范（`index.ts` 导出带 `install` 的组件并再导出类型、`src/Xxx.vue` 实现、`style/index.scss` 样式、`types.ts` 类型、`__tests__/` 测试）。组件只消费语义 `--aero-*` token（禁止硬编码视觉值与引用基础色板），自动支持明暗主题与 locale 切换。本规范以 Button 为样板迁移为 `Aero` 前缀，并补齐 Input 与 Icon；不实现其它组件（Tag/Select/Tooltip 等）与 resolver。

## Boundary Context (Optional)

- **In scope**：`AeroButton`、`AeroInput`、`AeroIcon` 三个组件及其类型、样式与测试；「一个组件一个文件夹」目录与导出契约；组件 barrel（`packages/components/index.ts`）与根 barrel（`packages/index.ts`）聚合、`AeroUI` 全局注册；`--aero-*` 语义 token 消费约束；locale 内置文案接入。
- **Out of scope**：其它组件（Tag/Select/Tooltip 等，属后续 spec）；resolver 实现（`AeroResolver`）；主题 token 定义与迁移（属 theme）；i18n 机制本身（属 i18n）；`AI_CONTEXT.md` 与文档站。
- **Adjacent expectations**：`theme` 已提供 `--aero-*` 语义变量与 `.aero-theme-light` / `.aero-theme-dark` 明暗主题；`i18n` 已提供 `useLocale` hook 与 `zh-cn` / `en` 语言包骨架，本 spec 仅消费 `useLocale` 并在语言包中补充组件文案 key；`foundation` 已提供 `aero-ui/*` 路径别名与 `./components/*` exports 子路径。

## Requirements

### Requirement 1: 组件目录与导出契约
**Objective:** As a 组件库维护者，I want 每个组件遵循「一个组件一个文件夹」的结构并导出统一契约，so that 组件可被一致地实现、复用与按需导入。

#### Acceptance Criteria
1.1 The 组件库 shall 以「一个组件一个文件夹」组织组件，每个组件文件夹包含 `index.ts`、`src/Xxx.vue`、`style/index.scss`、`types.ts` 与 `__tests__/`。

1.2 The 组件库 shall 通过组件 `index.ts` 导出带 `install` 方法的 `AeroXxx` 组件对象，并再导出其 `types.ts` 中的类型。

1.3 The 组件库 shall 使每个组件同时支持完整注册（`app.use`）与按需（局部）注册两种导入方式。

1.4 The 组件库 shall 仅在本规范范围内实现 `AeroButton`、`AeroInput`、`AeroIcon` 三个组件，不实现其它组件。

1.5 The 组件库 shall 通过组件 barrel `packages/components/index.ts` 聚合 re-export `button` / `input` / `icon` 三个组件，具名导出 `AeroButton` / `AeroInput` / `AeroIcon` 及其类型。

1.6 The 组件库 shall 通过根 barrel `packages/index.ts` re-export（`export * from './components'`、`export * from './locale'`）并提供默认导出 `AeroUI`（含 `install(app)` 全局注册三个组件），使 `import { AeroButton } from 'aero-ui'` 与 `app.use(AeroUI)` 均可解析。

### Requirement 2: AeroButton 组件
**Objective:** As a 消费者，I want 一个可复用的 `AeroButton` 按钮组件，so that 以统一的视觉与交互提供点击操作，并支持类型、尺寸、禁用、加载中与图标等状态。

#### Acceptance Criteria
2.1 The AeroButton 组件 shall 提供按钮类型属性（type），支持主色（primary）、默认（default）、危险（danger）、链接（link）等类型。

2.2 The AeroButton 组件 shall 提供尺寸属性（size），支持大（large）、中（main）、小（small）等尺寸档位。

2.3 The AeroButton 组件 shall 提供禁用（disabled）与加载中（loading）状态，处于禁用或加载中时不触发点击。

2.4 The AeroButton 组件 shall 提供图标（icon）属性，并通过 `AeroIcon` 渲染对应图标。

2.5 When 用户点击按钮，the AeroButton 组件 shall 触发点击事件（click）。

2.6 The AeroButton 组件 shall 支持原生按钮类型（button / submit / reset），使按钮在表单中行为正确。

### Requirement 3: AeroInput 组件
**Objective:** As a 消费者，I want 一个可复用的 `AeroInput` 输入框组件，so that 以统一的视觉与交互进行表单输入，并支持受控值、占位符、禁用与清空。

#### Acceptance Criteria
3.1 The AeroInput 组件 shall 提供受控值属性（modelValue），并通过 `update:modelValue` 事件同步用户输入。

3.2 The AeroInput 组件 shall 提供占位符属性（placeholder），在输入为空时展示提示文案。

3.3 The AeroInput 组件 shall 提供禁用（disabled）状态，禁用时不可编辑。

3.4 The AeroInput 组件 shall 提供可清空（clearable）能力，在有值时展示清空入口并触发清空事件（clear）。

3.5 When 用户输入或失焦，the AeroInput 组件 shall 触发相应的输入（input）与变更（change）事件。

### Requirement 4: AeroIcon 组件
**Objective:** As a 消费者，I want 一个可复用的 `AeroIcon` 图标组件，so that 通过图标名统一渲染图标，并支撑 `AeroButton` 的图标属性与 `AeroInput` 的清空入口。

#### Acceptance Criteria
4.1 The AeroIcon 组件 shall 通过图标名属性（name）渲染对应的图标。

4.2 The AeroIcon 组件 shall 提供尺寸属性（size），控制图标尺寸。

4.3 The AeroIcon 组件 shall 支持通过颜色属性（color）或继承当前文本颜色（currentColor）渲染图标颜色。

4.4 If 传入未知图标名，the AeroIcon 组件 shall 渲染为空内容而不抛错。

### Requirement 5: 样式与语义 token 约束
**Objective:** As a 组件库维护者，I want 组件样式只消费语义 `--aero-*` 变量并以 BEM 命名，so that 主题与品牌变更无需改动组件即可全局生效，明暗模式自动生效。

#### Acceptance Criteria
5.1 The 组件样式 shall 只引用 `--aero-*` 语义变量，禁止硬编码颜色、间距、圆角等视觉值。

5.2 The 组件样式 shall 禁止直接引用基础色板（例如 `--aero-blue-6` 或 SCSS `$blue-6`）。

5.3 The 组件 DOM 类名 shall 采用 BEM 命名（如 `aero-button`、`aero-button__loading` 与 `is-loading` / `is-disabled` 等状态修饰符）。

5.4 While 根元素应用 `.aero-theme-light` 或 `.aero-theme-dark`，the 组件 shall 自动呈现对应明暗主题的视觉。

### Requirement 6: 国际化（locale）支持
**Objective:** As a 组件开发者与消费者，I want 组件通过 locale 机制获取内置文案，so that 无障碍描述与默认占位符等文案随语言自动切换。

#### Acceptance Criteria
6.1 The 组件 shall 通过 `useLocale` 获取翻译函数，用于内置文案（如加载文案、默认占位符）。

6.2 When 当前语言切换，the 组件内置文案 shall 随 `useLocale` 返回的文案自动更新。

6.3 The 组件 shall 在语言包中补充并维护本组件所需的文案 key（`zh-cn` 与 `en` 各一份）。

### Requirement 7: 类型安全与编码约定
**Objective:** As a 组件库维护者，I want 组件严格遵循类型安全与 `<script setup>` 编码约定，so that 组件实现一致、类型可被消费者依赖。

#### Acceptance Criteria
7.1 The 组件实现 shall 使用 `<script setup lang="ts">` 与 `defineProps<T>()`（含 `withDefaults`）、`defineEmits<T>()`，并禁用 Options API。

7.2 The 组件 props 与 emits 类型 shall 定义在组件 `types.ts` 中，并从 `types.ts` 导出供消费者依赖。

7.3 The 组件类型定义 shall 遵循 TypeScript strict 模式，禁止使用 `any`。

7.4 The 每个组件 shall 提供共置的单元测试（`__tests__/`），覆盖其 props 行为、事件与渲染。
