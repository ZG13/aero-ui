# Brief: date-picker

## Problem

下游应用在表单中录入日期（生日、起止时间、计划日期等）时，缺少一个**日历面板选择**的日期控件。现有的 `AeroInput` 是自由文本，无日历交互、无日期格式化/解析语义、无范围选择；用户需自建日历弹层或依赖浏览器原生 `input[type=date]`（样式不可控、明暗主题/国际化难统一）。需要一个对齐 element-plus `el-date-picker` 的日期选择框。

## Current State

- `select` 已交付下拉面板范式（弹层展开/收起、click-outside、Escape 关闭），但其弹层定位是**组件内手写的 fixed + getBoundingClientRect**，未抽成通用工具。
- `form` 已提供 `useFormSize`/`useFormDisabled` + `formItemContextKey.validate(trigger)` 完整契约，date-picker 作为表单控件直接消费。
- `input-number` 已确立「组件 + 纯逻辑模块 + 表单集成」的参照范式。
- 项目当前**无日期库依赖**（deps：@vueuse/core、async-validator、vue-i18n）。
- 缺口：无日期选择控件；无通用弹层定位工具（select 手写定位存在重复造轮子隐患）。

## Desired Outcome

新增 `AeroDatePicker` 日期选择框组件：受控日期值（`Date | string | number`，经 dayjs 归一），支持 `type="date"`（单日期）与 `type="daterange"`（日期范围）；触发器回显格式化日期，点击展开日历面板（年月导航 + 日期网格），支持 `format`/`value-format`、`placeholder`/`start-placeholder`/`end-placeholder`、`disabled`/`size`、`disabled-date` 禁用日期、`clearable` 清空、`editable`；消费 form 上下文。同步交付**通用弹层定位 hook `usePopper`**（`packages/hooks/use-popper.ts`），date-picker 作为首个消费者，未来 select/time-picker 可复用。

## Approach

**单 spec（Path C）**，`usePopper` 作为共享基础设施随本 spec 交付（不独立成 spec）。

- **日期处理**：引入 `dayjs`（element-plus 同款），处理解析/格式化/月历生成/范围运算。封装一层薄适配（`src/date.ts`），避免组件直接散落 dayjs 调用。
- **弹层定位**：抽 `packages/hooks/use-popper.ts`（定位计算 + 滚动/resize 收起 + click-outside），date-picker 使用；select 的定位重构为非阻塞后续优化（不强制回填，避免范围蔓延）。
- **日历面板**：`AeroDatePicker` 内含日历面板（年月导航 + 6×7 日期网格 + 禁用态 + 范围 hover），teleport 到 body 经 usePopper 定位。
- **表单集成**：复用 `useFormSize`/`useFormDisabled` + `formItemContextKey`，与 Input/Select/InputNumber 同一路径。

**Why**：`usePopper` 规模小、无独立产品价值，随 date-picker 交付最务实；dayjs 成熟可靠，避免手写闰年/时区/格式化；date + daterange 覆盖最常用场景，边界清晰。

## Scope

- **In**: `AeroDatePicker` 组件（实现/类型/样式/测试）；`type="date"` / `type="daterange"`；`modelValue`（`Date | string | number | [.., ..]`）；`format`/`value-format`/`placeholder`/`start-placeholder`/`end-placeholder`/`disabled`/`size`/`disabled-date`/`clearable`/`editable`；日历面板（年月导航 + 日期网格 + 禁用态 + 范围选择）；`usePopper` 通用弹层定位 hook；表单上下文集成；`--aero-*` token 消费；dayjs 依赖；组件/根 barrel + `AeroUI` 注册；docs 中英双语文档。
- **Out**: 其它 type（`dates`/`week`/`month`/`monthrange`/`year`/`datetime`/`datetimerange`）；时间选择（time-picker 内嵌）；快捷选项（`shortcuts`）；`select` 定位回填（非阻塞后续优化）。

## Boundary Candidates

- `AeroDatePicker` 组件（触发器 + 日历面板 + 表单集成）—— 一个责任域。
- `usePopper` 通用弹层定位 hook —— 跨组件基础设施，随本 spec 交付。
- 日期纯逻辑层（dayjs 薄封装）—— date-picker 内部模块。

## Out of Boundary

- 其它 date-picker type（`dates`/`week`/`month`/`year`/`datetime`/…）—— 后续 spec。
- 时间选择能力、快捷选项 `shortcuts` —— 后续 spec。
- `select` 的弹层定位回填 —— 非阻塞，独立后续优化。
- 其它表单控件（TimePicker/Cascader 等）。

## Upstream / Downstream

- **Upstream**: `form`（`useFormSize`/`useFormDisabled` + `formItemContextKey`）；`theme`（`--aero-*` token）；`i18n`（如需占位/面板文案）；`resolver`（`kebabCase` 天然支持 `AeroDatePicker`）；**dayjs**（新增依赖）。
- **Downstream**: 表单日期场景；`usePopper` 供 `select`/`time-picker`/`cascader` 后续复用；`time-picker` 后续可基于 date-picker 的日历面板复用。

## Existing Spec Touchpoints

- **Extends**: 无（新增独立 spec；`usePopper` 为新增共享 hook，不修改 `select` 现有实现）。
- **Adjacent**: `select`（同为弹层控件，`usePopper` 未来可复用以替换其手写定位）；`input`/`input-number`（同为表单控件，复用表单契约）；`form`（消费上下文契约，勿重复实现继承逻辑）。

## Constraints

- Vue 3.4 + TypeScript strict；`<script setup lang="ts">` + `defineProps<T>()`/`defineEmits<T>()`；props/types 放 `types.ts`。
- 组件只消费 `--aero-*` 语义 token，禁止硬编码颜色/间距/圆角；BEM 命名（`aero-date-picker` / `aero-date-picker__panel` / `aero-date-table` 等）。
- 受控组件：值完全由 `modelValue` 驱动；内部经 dayjs 归一为统一日期对象。
- 引入 `dayjs`（^1.11.x），外部化于构建（对齐 @vueuse/core）。
