# Brief: core-components

## Problem

组件库需要可复用的核心组件来验证并确立组件编写规范（目录结构、类型、样式、测试、导出契约），作为后续组件的样板。

## Current State

- 上一版仅实现 `EpButton`（Button.vue + types.ts + style + test），可参照其模式。
- 当前无任何组件代码。

## Desired Outcome

- 实现 3 个核心组件：`AeroButton`、`AeroInput`、`AeroIcon`。
- 确立「一个组件一个文件夹」规范：`index.ts`（导出 + install）、`src/Xxx.vue`、`style/index.scss`、`types.ts`、`__tests__/`。
- 组件只消费 `--aero-*` 语义 token，支持明暗模式与 locale。

## Approach

以 Button 为样板重建，迁移为 `Aero` 前缀与 `--aero-*` token；补齐 Input（表单输入）与 Icon（图标渲染，Button 的 icon 属性依赖它）作为第二、第三个组件。

## Scope

- **In**: AeroButton、AeroInput、AeroIcon 三组件及其 types/style/test。
- **Out**: 其它组件（Tag/Select/Tooltip 等后续 spec）、resolver 实现。

## Boundary Candidates

- 组件目录与导出契约
- 类型与测试规范

## Out of Boundary

- 主题 token 定义（theme spec）、i18n 内容（i18n spec）、resolver、AI 文档。

## Upstream / Downstream

- **Upstream**: foundation、theme、i18n。
- **Downstream**: resolver（消费组件导出）、ai-friendliness（记录组件规范）。

## Existing Spec Touchpoints

- **Extends**: 无。
- **Adjacent**: theme（token 名）、i18n（文案）、resolver、ai-friendliness。

## Constraints

- `<script setup lang="ts">` + `defineProps<T>()`；props/types 放 `types.ts`；禁用 Options API。
- 只用 `--aero-*` 语义变量；明暗切换用 `.aero-theme-light` / `.aero-theme-dark`。
