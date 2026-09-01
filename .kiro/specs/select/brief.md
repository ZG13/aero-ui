# Brief: select

## Problem

aero-ui 目前已有 Button/Input/Icon/Form/FormItem 五个组件，但缺少**下拉选择**这一高频表单控件。下游应用做表单时，「从一组选项中选择一个/多个值」是最常见的输入形态之一；没有 `AeroSelect`，用户只能绕过组件库自行实现，破坏一致性。同时，`form` spec 已预留了「表单控件消费 `formItemContext` 接入校验与 size/disabled 继承」的契约，但尚无一真实控件落地该契约，`AeroSelect` 是首个、也是最典型的验证载体。

## Current State

- 已有组件范式成熟（`packages/components/*/`：index.ts + src/Xxx.vue + style/index.scss + types.ts + __tests__/），`button`/`input`/`form` 已按此落地。
- `theme` 提供完整语义 token（`--aero-border-*`/`--aero-radius-*`/`--aero-text-*`/`--aero-space-*`/`--aero-bg-*`/`--aero-danger-*`），足以支撑触发器与下拉面板样式。
- `i18n`（zh-cn/en）已提供 `useLocale` 与语言包骨架；`form` 已提供 `formContextKey`/`formItemContextKey`、`useFormSize`/`useFormDisabled` 及 `FormItemContext.validate(trigger)` 入口。
- `resolver` 的 `AeroResolver` 通过 `kebabCase` 自动把 `AeroSelect` 映射到 `aero-ui/components/select`，无需改动。
- `AeroIcon` 仅有 5 个图标（search/close/loading/settings/link），**无下拉箭头**；清空/删除所需的 `close` 已存在。
- 项目无浮层/popper 依赖，`tech.md` 未列任何浮层库。

## Desired Outcome

- 提供 `AeroSelect`（下拉选择）与 `AeroOption`（选项）两个组件，API 面对齐 element-plus 的 `el-select`/`el-option` 核心面：`model-value`/`multiple`/`clearable`/`filterable`/`placeholder`/`disabled`/`size`。
- 支持单选与多选（`multiple`，标签式回显 + 可删除）、可清空、可搜索（`filterable` 本地过滤）、选项禁用、占位文案。
- 作为表单控件接入 `form` 上下文：消费 `useFormSize`/`useFormDisabled` 继承表单/表单项级 `size`/`disabled`，并在 blur/change 时触发所在 `formItemContext.validate(trigger)` 即时校验。
- 样式仅消费语义 `--aero-*` token，BEM 命名；明暗主题自动生效。
- 在 barrel/`AeroUI` 注册，docs-site 新增 select 双语文档 + 内嵌示例。

## Approach

**方案 A — 自研轻量弹层**（已确认）。

下拉面板用 `teleport` 渲染到 `body` 下的定位容器，相对触发器做绝对定位；`open`/`close` 由组件内状态管理，配合手动 `click-outside` 与 `Escape` 关闭。下拉箭头用 CSS 旋转 chevron（`currentColor`，不硬编码视觉值），清空与多选删除复用已有 `AeroIcon` 的 `close` 图标。**不引入浮层库**，与 aero-ui「零浮层依赖、AI 友好可控」的定位一致；表单内下拉无复杂 overflow/碰撞场景，自研弹层足够。

选项数据经 `AeroOption` 子组件声明（`<AeroOption label="" value="" />`），内部通过 provide/inject 收集选项；选中值回显（单选取匹配选项的 label，多选渲染标签）。`filterable` 时本地过滤选项（按 label 匹配），无远程搜索。

## Scope

- **In**:
  - `AeroSelect`：`modelValue`/`multiple`/`clearable`/`filterable`/`placeholder`/`disabled`/`size` 等 props；`update:modelValue`/`change`/`clear`/`visible-change` 事件；`v-model` 支持 `string|number` 与数组。
  - `AeroOption`：`label`/`value`/`disabled` props，声明式选项。
  - 弹层逻辑：teleport + 定位 + click-outside + Escape 关闭 + 滚动/失焦收起。
  - 表单集成：消费 `formItemContext`（size/disabled 继承 + blur/change 触发即时校验）。
  - 类型（`types.ts` 导出 `SelectProps`/`SelectEmits`/`OptionProps`，JSDoc `@default`）、样式（`--aero-*` + BEM）、共置测试。
  - barrel/`AeroUI` 注册、i18n 文案（placeholder 等）、docs-site 双语文档 + 内嵌示例。
- **Out**:
  - 远程搜索（`remote`/`filter-method`）、选项分组（`AeroOptionGroup`）、虚拟滚动（大量选项）、自定义选项模板插槽、`allow-create` 等高级特性 —— 后续 spec。
  - 其它表单控件（Checkbox/Radio/Switch 等）—— 各自后续 spec。

## Boundary Candidates

- **触发器层**：单/多选值回显、placeholder、清空、下拉箭头、size/disabled 态。
- **弹层与定位层**：teleport 容器、绝对定位、click-outside、Escape、展开收起。
- **选项层**：`AeroOption` 声明 + provide/inject 收集 + 过滤/禁用/选中态。
- **表单集成层**：`useFormSize`/`useFormDisabled` 消费 + blur/change 触发 `formItemContext.validate`。

## Out of Boundary

- 远程搜索、选项分组、虚拟滚动、自定义模板、`allow-create` —— 本 spec 只对齐 element-plus 常规单选/多选/搜索面。
- 其余表单控件（Checkbox/Radio/Switch）—— 交由各自后续 spec，本 spec 仅验证 form 上下文契约在真实控件上的落地。

## Upstream / Downstream

- **Upstream**: `core-components`（复用 `AeroIcon` 的 `close`；遵循 button/input 的目录/类型/样式/测试范式）、`form`（消费 `formItemContext`/`useFormSize`/`useFormDisabled`，作为首个表单控件）、`theme`（语义 token）、`i18n`（placeholder 文案 zh-cn/en）、`foundation`（构建管线）。
- **Downstream**: 后续表单控件（Checkbox/Radio/Switch）复用本 spec 确立的「表单控件接入 form 上下文」范式；下游应用直接使用 `aero-select`。

## Existing Spec Touchpoints

- **Extends**: `form` —— 落地 form 预留的「表单控件消费 `formItemContext`」契约，是首个真实消费方（后续控件据此参照）。
- **Adjacent**: `resolver`（`kebabCase` 已自动支持，无需改）、`docs-site`（新增 select 双语文档）、`i18n`（新增 placeholder 文案）、`core-components`（复用 `AeroIcon`）。

## Constraints

- Vue 3.4 + TypeScript（strict，no-any）+ Vite 5 + SCSS；组件仅用 `<script setup lang="ts">` + `defineProps<T>()`，props/types 放同级 `types.ts`。
- 组件只消费语义 `--aero-*` 变量，禁止硬编码与直接引用基础色板；明暗切换用 `.aero-theme-light`/`.aero-theme-dark`。
- 不引入浮层/popper 第三方依赖；弹层自研（teleport + click-outside）。
- 下拉箭头用 CSS 绘制（`currentColor`），清空/删除复用 `AeroIcon` 的 `close`，不为本组件新增图标资产。
- context 传递用 Vue `InjectionKey`（Symbol），禁止字符串 key；表单集成走 `form` 既有 `useFormSize`/`useFormDisabled`，不重复实现。
