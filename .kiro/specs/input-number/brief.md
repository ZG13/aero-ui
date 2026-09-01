# Brief: input-number

## Problem

下游应用在表单中录入数值（数量、价格、评分、步进参数等）时，缺少一个带**步进按钮、精度控制、边界约束**的数字输入控件。现有的 `AeroInput` 是自由文本输入，无数值语义——不能限制范围（min/max）、不能按步长增减（step）、不能控制小数精度（precision），用户需在业务层自行做数值校验与格式化，重复且易错。

## Current State

- `core-components` 已交付 `AeroInput`（受控文本输入 + floating 占位 + clearable + 表单上下文消费），确立了「表单控件消费 form 上下文」的范式。
- `form` 已交付 `AeroForm`/`AeroFormItem`，提供 `formItemContextKey` 契约：`size`/`disabled` 继承（`useFormSize`/`useFormDisabled`）+ `validate(trigger)` 即时校验入口。
- `select` 已交付 `AeroSelect`/`AeroOption`，作为首个真实表单控件落地了上述契约，并确立了组件目录/类型/样式/测试的完整参照范式。
- 缺口：无数字输入控件；`AeroInput` 不适合承载数值语义（不希望为文本输入引入步进/精度逻辑使其复杂化）。

## Desired Outcome

新增 `AeroInputNumber` 数字输入框组件：受控数值（`number`），带右侧上下步进按钮，支持 `step`/`min`/`max`/`precision`/`step-strictly`/`disabled`/`size`/`controls`/`placeholder`/`name`/`readonly`；消费 `form` 上下文（`size`/`disabled` 继承 + blur/change 触发字段即时校验）；样式只消费 `--aero-*` 语义 token；配 docs-site 中英双语文档。作为又一个表单控件，复用 `select` 已确立的范式。

## Approach

**独立 `input-number` 组件文件夹**（`packages/components/input-number/`），对齐 `el-input-number` 核心 + 边缘能力，但 `controls-position` 仅默认右侧布局（不做 outer）。

- 组件结构：原生 `<input type="text" inputmode="decimal">`（手动解析以支持精度/边界/非法输入处理）+ 右侧上下步进按钮（复用 `AeroIcon` 的三角图标，或 CSS 绘制三角）。
- 数值逻辑层：独立处理步进（step 增减、step-strictly 强制 step 倍数）、边界 clamp（min/max，含 `-Infinity`/`Infinity` 默认）、精度（precision 四舍五入）、非法输入回退（失焦时按规则还原/修正）。
- 表单集成：复用 `form` 的 `useFormSize`/`useFormDisabled` + `formItemContextKey`，与 `AeroInput`/`AeroSelect` 同一路径。
- 事件契约：`update:modelValue`、`change`、`blur`、`focus`。

**Why**：独立组件避免污染 `AeroInput` 的纯文本语义；与 `select` 同构，可复用表单契约与既有测试范式；数值逻辑收敛在组件内部，不引入新依赖。

## Scope

- **In**: `AeroInputNumber` 组件（实现/类型/样式/测试）；`modelValue`（`number`）、`step`、`min`、`max`、`precision`、`step-strictly`、`disabled`、`size`、`controls`、`placeholder`、`name`、`readonly`；右侧步进按钮（`controls` 关闭时不显示）；表单上下文集成（`size`/`disabled` 继承 + blur/change 即时校验）；`--aero-*` token 消费；组件 barrel + 根 barrel + `AeroUI` 全局注册；docs-site 中英双语文档。
- **Out**: `controls-position="outer"`（按钮外侧布局）；字符串/大数高精度值；自定义步进按钮模板插槽；远程数值来源；其它表单控件。

## Boundary Candidates

- `AeroInputNumber` 组件（单一组件，含数值逻辑层 + 步进 UI）—— 一个责任域，不拆。
- 表单上下文消费（复用 `form`，非新增边界）。

## Out of Boundary

- `controls-position="outer"` 布局（本次仅默认右侧按钮）。
- 与 `AeroInput` 合并/复用其 floating 占位（数字输入保持普通 placeholder，不引入 floating）。
- 其它表单控件（Checkbox/Radio/Switch 等，各自后续 spec）。

## Upstream / Downstream

- **Upstream**: `form`（`useFormSize`/`useFormDisabled` + `formItemContextKey` 校验入口）；`core-components`（`AeroIcon` 步进三角）；`theme`（`--aero-*` 语义 token）；`i18n`（如占位文案走 locale）；`resolver`（`kebabCase` 映射天然支持 `AeroInputNumber`，无需改动）。
- **Downstream**: 表单场景（数量/价格录入）；未来可能依赖步进交互的复合组件（如 `AeroSlider` 可复用数值语义约定）。

## Existing Spec Touchpoints

- **Extends**: 无（新增独立 spec，不修改 `form`/`core-components` 的既有实现）。
- **Adjacent**: `input`（同为输入控件，需避免样式/语义耦合）；`select`（同为表单控件，参照其范式与测试结构）；`form`（消费其上下文契约，勿重复实现继承逻辑）。

## Constraints

- Vue 3.4 + TypeScript strict；`<script setup lang="ts">` + `defineProps<T>()`/`defineEmits<T>()`；props/types 放 `types.ts`。
- 组件只消费 `--aero-*` 语义 token，禁止硬编码颜色/间距/圆角；BEM 命名（`aero-input-number` / `aero-input-number__increase` / `__decrease` / `is-disabled` 等）。
- 受控组件：值完全由 `modelValue` 驱动，不复制可变状态。
- 对齐 `el-input-number` 的默认值语义（`step=1`、`min=-Infinity`、`max=Infinity`、`controls=true`、`precision=undefined`）。
