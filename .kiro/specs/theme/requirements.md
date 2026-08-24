# Requirements Document

## Introduction

本规范（theme）的目标是建立 `aero-ui` 的设计 token 体系：将根目录 `base/` 下暂存的原始 token（`color.scss`、`number.scss`）迁移到规范位置 `packages/theme/base/`，按类型拆分为单一职责的基础 token 文件；在其上建立语义化 `--aero-*` CSS 变量层；并通过 `.aero-theme-light` / `.aero-theme-dark` 根类实现明暗主题切换。组件只消费语义变量，禁止引用基础色板或硬编码视觉值。本规范不实现任何具体组件样式或国际化内容。

## Boundary Context (Optional)

- **In scope**：基础 token 的迁移与按类型拆分（color / number / radius / font / stroke / insets / opacity / typography）、语义 `--aero-*` 变量层、light/dark 主题映射、主题入口（`index.scss`）。
- **Out of scope**：任何具体组件样式（Button/Input/Icon 等）、国际化字典、resolver、文档站与 `AI_CONTEXT.md`。
- **Adjacent expectations**：`foundation` 已提供 `./theme/*` 的 exports 直通子路径与 `aero-ui` 路径别名；`core-components` 将只消费本规范产出的 `--aero-*` 语义变量（禁止引用基础色板）；`ai-friendliness` 后续将记录本规范的 token 约定。

## Requirements

### Requirement 1: 基础 token 迁移与按类型拆分
**Objective:** As a 组件库维护者，I want 原始 token 从根目录 `base/` 迁移到规范位置并按类型拆分为单一职责文件，so that 语义层拥有清晰、单一职责的基础 token 来源。

#### Acceptance Criteria
1.1 The 主题系统 shall 将根目录 `base/color.scss` 迁移到 `packages/theme/base/color.scss`，并完整保留灰阶（coolgrey / neutralgrey / warmgrey）、基础黑白（base-black / base-white）、opac 透明黑/白以及全部彩色系（含各 `*-opac`）的色值。

1.2 The 主题系统 shall 将根目录 `base/number.scss` 中混杂的间距数字、字体族、字号/行高/字重、透明度 token 拆分到对应的 `number.scss`、`font.scss`、`typography.scss`、`opacity.scss`。

1.3 The 主题系统 shall 在 `packages/theme/base/` 下提供按类型划分的基础 token 文件：`color`、`number`、`radius`、`font`、`stroke`、`insets`、`opacity`、`typography`。

1.4 The 主题系统 shall 通过 `packages/theme/base/index.scss` 统一聚合并转发全部基础 token，供语义层引用。

1.5 When 基础 token 完成迁移，the 主题系统 shall 移除根目录 `base/`（该目录不再作为 token 来源）。

### Requirement 2: 语义 token 层（--aero-*）
**Objective:** As a 组件库维护者与下游消费者，I want 一套语义化 `--aero-*` 变量层，so that 组件通过语义名引用 token 而非硬编码值或基础色板。

#### Acceptance Criteria
2.1 The 主题系统 shall 提供语义色板变量，覆盖主色（`--aero-primary-*`）、成功（`--aero-success-*`）、警告（`--aero-warning-*`）、危险（`--aero-danger-*`）与链接（`--aero-link-*`），并各自覆盖 1–10 阶。

2.2 The 主题系统 shall 提供语义中性变量，包括文本（`--aero-text-*`）、背景（`--aero-bg-*`）、边框（`--aero-border-*`）与填充（`--aero-fill-*`）。

2.3 The 主题系统 shall 提供语义非颜色变量，包括圆角（`--aero-radius-*`）、间距（`--aero-space-*`）、字体（`--aero-font-*`）、排版（`--aero-typography-*`）、透明度（`--aero-opacity-*`）、描边（`--aero-stroke-*`）与内边距（`--aero-insets-*`）。

2.4 The 语义变量 shall 以 CSS 自定义属性（`--aero-*`）形式对外暴露，供组件与下游消费者引用。

### Requirement 3: 明暗主题切换
**Objective:** As a 消费者，I want 通过根类切换明暗主题，so that 同一套语义变量在不同模式下呈现不同取值而无需修改组件。

#### Acceptance Criteria
3.1 When 根元素添加 `.aero-theme-light` 类，the 主题系统 shall 应用 light 模式下的全部语义变量取值。

3.2 When 根元素添加 `.aero-theme-dark` 类，the 主题系统 shall 应用 dark 模式下的全部语义变量取值。

3.3 The 主题系统 shall 在未显式指定主题类时应用默认主题（light），使语义变量始终有确定取值。

3.4 The 主题系统 shall 仅允许使用 `.aero-theme-light` / `.aero-theme-dark` 切换主题，并禁用 `.dark` 类作为主题切换手段。

### Requirement 4: 组件消费约束
**Objective:** As a 组件库维护者，I want 组件只消费语义变量，so that 品牌变更与暗黑模式无需逐组件修改即可全局生效。

#### Acceptance Criteria
4.1 The 组件样式 shall 只引用 `--aero-*` 语义变量。

4.2 The 组件样式 shall 禁止硬编码颜色、间距、圆角等视觉值。

4.3 The 组件样式 shall 禁止直接引用基础色板（例如 `--aero-blue-6` 或 SCSS `$blue-6`）。

### Requirement 5: 主题入口与边界
**Objective:** As a 下游 spec（core-components）与消费者，I want 一个稳定的主题入口，so that 一次引入即可获得全部基础 token、语义变量与明暗主题。

#### Acceptance Criteria
5.1 The 主题系统 shall 提供一个主题入口 `packages/theme/index.scss`，一次引入即包含全部基础 token、语义变量与明暗主题。

5.2 The 主题系统 shall 与 foundation 的 exports 子路径 `./theme/*` 对齐，使消费者可通过 `aero-ui/theme/*` 解析主题样式。

5.3 The 主题系统 shall 不实现任何具体组件样式，也不实现国际化内容。
