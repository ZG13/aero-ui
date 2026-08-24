# Brief: theme

## Problem

设计 token（颜色、间距、字体、透明度等）目前以 SCSS 变量形式临时存放在根目录 `base/`（`color.scss`、`number.scss`），位置与规范不一致，且 `number.scss` 混杂了间距、字体、透明度等多类 token。需要将这些基础 token 迁移到规范位置，并建立语义化 `--aero-*` 变量层与明暗主题。

## Current State

- `base/color.scss`：完整色板（灰阶、基础黑白、opac 透明黑/白、12 个彩色系 + opac）。
- `base/number.scss`：间距数字、字体/字号/行高/字重、透明度、阴影（内容混杂）。
- 上一版结构：`packages/theme/base/{color,number,radius,font,stroke,insets,opacity,typography,index}.scss` + `light.scss` / `dark.scss` / `index.scss`。

## Desired Outcome

- 基础 token 从根目录 `base/` 迁移到 `packages/theme/base/`，并按类型拆分（color / number / radius / font / stroke / insets / opacity / typography）。
- 建立语义层 `--aero-*`（如 `--aero-primary-6`、`--aero-text-main`、`--aero-radius-main`）。
- 明暗模式通过 `.aero-theme-light` / `.aero-theme-dark` 切换。

## Approach

迁移并重构 `base/` → `packages/theme/base/`，拆分为单一职责文件；在其上建立语义 token 层，分别映射 light/dark 两套值；组件只消费语义层，禁止引用基础色板。

## Scope

- **In**: token 迁移与拆分、语义 `--aero-*` 层、light/dark 主题映射、主题入口。
- **Out**: 具体组件样式、国际化。

## Boundary Candidates

- 基础 token（primitive）文件
- 语义 token（semantic）映射
- 明暗主题切换

## Out of Boundary

- 组件实现、i18n、resolver、AI 文档。

## Upstream / Downstream

- **Upstream**: foundation（构建与别名）。
- **Downstream**: core-components（消费语义 token）、ai-friendliness（记录 token 约定）。

## Existing Spec Touchpoints

- **Extends**: 无。
- **Adjacent**: core-components（组件只准用 `--aero-*`）。

## Constraints

- 组件禁止硬编码颜色/间距，只能用 `--aero-*` 语义变量；明暗切换用 `.aero-theme-light` / `.aero-theme-dark`（禁用 `.dark`）。
