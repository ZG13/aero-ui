# Brief: radio

## Problem

表单场景需要「单选」控件：用户在若干互斥选项中选一个值。aero-ui 已有 form 上下文契约与 select / input-number / date-picker 等表单控件，但缺少单选这一基础表单能力。下游在「性别 / 支付方式 / 可见范围」等互斥选择处没有统一、可主题化、可校验的组件可用。

## Current State

- form 上下文契约已确立：`formContextKey` / `formItemContextKey`（`packages/components/form/src/constants.ts`）+ `useFormSize` / `useFormDisabled` hooks，select / input-number / date-picker 均已按同一模式接入（disabled prop 显式 `undefined`、`validate('change')` fire-and-forget）。
- 组件目录 / 导出契约（手写 `install`）/ BEM 样式 / 语义 token / 类型 / 测试 / 双语文档规范已由 core-components 与 select 落地，可直接复用。
- 分组子项注册模式已有先例：select 的 `AeroOption` 通过 context + addOption/removeOption 注册到 `AeroSelect`。
- 目前没有任何 radio 组件。

## Desired Outcome

提供 `AeroRadio` / `AeroRadioGroup` / `AeroRadioButton` 三个组件，完整对齐 element-plus radio 家族 API（`v-model` / `value` / `label` / `size` / `disabled` / `border` / `name` / `fill` / `textColor` / `change`），消费 form 上下文（size/disabled 继承、change 触发校验），内置中英双语文案，明暗主题，按需导入（resolver），并在文档站提供双语独立文档。

## Approach

与 select 的 Option 分组同构：`AeroRadioGroup` 通过 `provide(radioContextKey)` 下发分组状态（`modelValue`、`size`、`disabled`、`name`、`fill`、`textColor`），`AeroRadio` / `AeroRadioButton` 注入并注册子项；视觉层用 div 绘制圆点 / 按钮，底层叠加透明原生 `<input type="radio">` 撑起键盘导航、`name` 分组与原生表单语义（a11y）。radio 家族三组件强耦合，收敛为单个 spec。

## Scope

- **In**:
  - `AeroRadio`（圆点样式）、`AeroRadioGroup`（分组容器）、`AeroRadioButton`（按钮样式）
  - form 上下文接入（size/disabled 继承、change 触发校验）
  - i18n 文案（`components.radio.*`，zh-cn / en）
  - BEM 样式 + 语义 `--aero-*` token + 明暗主题
  - vitest 测试（组件 + 纯逻辑）
  - 双语文档（zh-CN / en-US 各一篇）+ resolver 按需导入登记 + barrel 导出
- **Out**: 跨页多选、级联选择、自定义渲染插槽之外的高级定制。

## Boundary Candidates

- radio 家族三组件（单个 spec，相互强耦合，不拆）
- 纯逻辑（子项注册、值比较、name 生成）抽到 `src/constants.ts` 或纯 ts，便于独立单测

## Out of Boundary

- 不修改 / 不扩展 form 上下文契约本身（仅消费）
- 不做 checkbox、switch 等其它选择类控件（留给后续 spec）

## Upstream / Downstream

- **Upstream**: form（上下文契约）、core-components（组件规范）、theme（语义 token）、i18n（locale 系统）
- **Downstream**: 未来 checkbox / switch 等选择类控件可复用 radioGroup 的分组注册模式

## Existing Spec Touchpoints

- **Extends**: 无（全新 spec）
- **Adjacent**: form（上下文消费）、select（分组注册模式参考）、core-components（目录/导出/样式规范来源）

## Constraints

- 仅 `<script setup lang="ts">` + `defineProps<T>()`；props/types 放同级 `types.ts`，字段带中文 JSDoc 与 `@default`
- 仅消费语义 `--aero-*` token；明暗切换用 `.aero-theme-light` / `.aero-theme-dark`
- 组件前缀 `Aero`，导出契约沿用手写 `install` 模式
- 完整对齐 element-plus API 语义与默认值（含 `label` 作值的兼容语义与 `value` 新别名）
