# Brief: resolver

## Problem

组件库需支持按需导入：消费者在模板中直接写 `<AeroButton />`，通过 `unplugin-vue-components` + resolver 自动按需引入组件与样式，避免全量引入。

## Current State

- 上一版已有 `packages/resolver/`（可参照），当前为空。

## Desired Outcome

- 实现 `AeroResolver`（unplugin-vue-components 的 resolver），将 `<AeroX />` 映射到 `aero-ui/components/x` 并按需引入样式。
- 提供 `aero-ui/resolver` 子路径导出。

## Approach

重建 `packages/resolver/`，按组件导出契约（`packages/components/*/index.ts`）实现「名称 → 路径 → 样式」的解析；与 exports 映射（`./components/*`）对齐。

## Scope

- **In**: AeroResolver 实现、子路径导出、与 unplugin-vue-components 的对接说明。
- **Out**: 新组件、组件样式内容。

## Boundary Candidates

- resolver 名称映射
- 样式路径解析

## Out of Boundary

- 组件实现、主题、i18n、AI 文档。

## Upstream / Downstream

- **Upstream**: foundation、core-components（依赖组件导出契约）。
- **Downstream**: ai-friendliness（记录按需导入用法）。

## Existing Spec Touchpoints

- **Extends**: 无。
- **Adjacent**: core-components（导出契约）、ai-friendliness（用法文档）。

## Constraints

- 与 exports 映射 `./components/*`、`./resolver` 对齐；样式需按需引入。
