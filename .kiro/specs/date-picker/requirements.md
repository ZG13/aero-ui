# Requirements Document

## Introduction

本规范（date-picker）的目标是在 aero-ui 组件库中新增**日期选择框**能力：实现 `AeroDatePicker` 组件，使下游应用能以受控方式通过日历面板选择单个日期（`date`）或日期范围（`daterange`）。组件对齐 element-plus `el-date-picker` 的核心面：触发器回显格式化日期，点击展开日历面板（年月导航 + 日期网格 + 禁用日期 + 范围选择），支持日期格式化、占位文案、禁用/尺寸、禁用日期、可清空与可编辑。作为表单控件，`AeroDatePicker` 消费 `form` spec 已确立的表单上下文契约，自动继承表单/表单项级 `size`/`disabled`，并在 blur/change 时触发字段即时校验。

## Boundary Context (Optional)

- **In scope**：`AeroDatePicker` 组件及其类型、样式与测试；`type="date"`（单日期）与 `type="daterange"`（日期范围）；受控日期值（`Date | string | number` 单值，`[start, end]` 范围）；`format`/`value-format`/`placeholder`/`start-placeholder`/`end-placeholder`/`disabled`/`size`/`disabled-date`/`clearable`/`editable`；日历面板（年月导航 + 日期网格 + 禁用态 + 范围选择）；通用弹层定位 `usePopper` hook；表单上下文集成（`size`/`disabled` 继承 + blur/change 触发字段即时校验）；组件 barrel 与根 barrel 聚合、`AeroUI` 全局注册；`--aero-*` 语义 token 消费约束；docs-site 中英双语文档 + 内嵌示例。
- **Out of scope**：其它类型（`dates`/`week`/`month`/`monthrange`/`year`/`datetime`/`datetimerange`）；时间选择能力（time-picker 内嵌）；快捷选项（`shortcuts`）；`select` 弹层定位的回填重构（非阻塞后续优化）。
- **Adjacent expectations**：`form` 已提供表单上下文（`size`/`disabled` 继承 + `validate(trigger)` 即时校验入口），本 spec 消费该契约；`theme` 已提供 `--aero-*` 语义变量与明暗主题，本 spec 仅消费；`i18n` 已提供 `useLocale` 与语言包骨架，本 spec 补充面板文案（若需）；`resolver` 的 `kebabCase` 映射已天然支持 `AeroDatePicker`，无需改动；`docs-site` 新增 date-picker 双语文档。本 spec 引入 `dayjs` 作为日期处理依赖。

## Requirements

### Requirement 1: 组件目录与导出契约
**Objective:** As a 组件库维护者，I want `AeroDatePicker` 遵循「一个组件一个文件夹」结构并导出统一契约，so that 组件可被一致地实现、复用与按需导入。

#### Acceptance Criteria
1.1 The 组件库 shall 以「一个组件一个文件夹」组织 `date-picker`，组件文件夹包含 `index.ts`、`src/DatePicker.vue`、`style/index.scss`、`types.ts` 与 `__tests__/`。

1.2 The 组件库 shall 通过组件 `index.ts` 导出带 `install` 方法的 `AeroDatePicker`，并再导出其 `types.ts` 中的类型。

1.3 The 组件库 shall 使 `AeroDatePicker` 同时支持完整注册（`app.use`）与按需（局部）注册两种导入方式。

1.4 The 组件库 shall 仅在本规范范围内实现 `date` 与 `daterange` 类型，不实现 `datetime`/`week`/`month`/`year` 等其它类型与时间选择、快捷选项。

1.5 The 组件库 shall 通过组件 barrel `packages/components/index.ts` 与根 barrel `packages/index.ts` 聚合 re-export `date-picker`，并将 `AeroDatePicker` 纳入 `AeroUI.install` 的全局注册。

### Requirement 2: 单日期选择（date）
**Objective:** As a 消费者，I want 通过日历面板选择单个日期，so that 受控绑定单个日期值。

#### Acceptance Criteria
2.1 The AeroDatePicker 组件 shall 提供 `type` 属性，支持 `'date'`（默认）与 `'daterange'`。

2.2 The AeroDatePicker 组件 shall 提供绑定值属性（`model-value`），单日期类型为 `Date | string | number`。

2.3 When 用户在日历面板点击某个日期，the AeroDatePicker 组件 shall 更新 `model-value` 为该日期并派发 `update:modelValue` 与 `change`，随后收起面板。

2.4 The AeroDatePicker 组件 shall 在触发器上回显选中日期，按 `format` 格式化展示。

2.5 When 选中值为空，the AeroDatePicker 组件 shall 展示占位文案而非日期。

### Requirement 3: 日期范围选择（daterange）
**Objective:** As a 消费者，I want 选择起止日期范围，so that 受控绑定 `[start, end]` 数组。

#### Acceptance Criteria
3.1 When `type` 为 `daterange`，the AeroDatePicker 组件 shall 以 `[start, end]` 数组形式绑定 `model-value`。

3.2 When 用户在范围态点击起始日期，the AeroDatePicker 组件 shall 记录起始日期；再点击结束日期（不得早于起始）时确定范围并派发 `update:modelValue` 与 `change`。

3.3 When 范围选择完成，the AeroDatePicker 组件 shall 收起面板并回显 `start - end`。

3.4 The AeroDatePicker 组件 shall 提供 `start-placeholder` 与 `end-placeholder`，分别作为范围起始与结束的占位文案。

3.5 When 用户选择结束日期早于起始日期，the AeroDatePicker 组件 shall 以新点击日期作为新的起始日期重新选择。

### Requirement 4: 日历面板
**Objective:** As a 消费者，I want 一个可导航的日历面板，so that 在可视网格中挑选日期。

#### Acceptance Criteria
4.1 The AeroDatePicker 组件 shall 提供日历面板，含年月导航（上/下月切换）与日期网格。

4.2 The AeroDatePicker 组件 shall 展示当前选中日期或当月日期，并允许切换到其它月份。

4.3 When 用户点击面板之外区域或按下 Escape，the AeroDatePicker 组件 shall 收起面板。

4.4 The AeroDatePicker 组件 shall 在面板展开/收起时派发 `visible-change` 事件，携带展开状态。

### Requirement 5: 日期格式化
**Objective:** As a 消费者，I want 控制日期的展示与绑定格式，so that 回显与值格式符合业务需求。

#### Acceptance Criteria
5.1 The AeroDatePicker 组件 shall 提供 `format` 属性，控制触发器上的日期展示格式，默认 `'YYYY-MM-DD'`。

5.2 The AeroDatePicker 组件 shall 提供 `value-format` 属性，控制绑定值的字符串格式；未设置时 `model-value` 为 `Date` 对象。

5.3 When `value-format` 已设置，the AeroDatePicker 组件 shall 以该格式的字符串派发 `update:modelValue`。

### Requirement 6: 禁用日期与整体禁用
**Objective:** As a 消费者，I want 禁用特定日期或整体禁用，so that 限制可选日期范围。

#### Acceptance Criteria
6.1 The AeroDatePicker 组件 shall 提供 `disabled-date` 函数属性，返回 `true` 的日期在面板中展示为禁用且不可选。

6.2 The AeroDatePicker 组件 shall 提供整体禁用属性（`disabled`），禁用后不可展开面板。

6.3 The AeroDatePicker 组件 shall 提供尺寸属性（`size`），支持 `'large' | 'main' | 'small'`，默认 `'main'`。

### Requirement 7: 可清空与可编辑
**Objective:** As a 消费者，I want 支持清空与可编辑，so that 可清除已选日期或手动输入。

#### Acceptance Criteria
7.1 The AeroDatePicker 组件 shall 提供 `clearable` 属性；有值时展示清空入口，点击清空并派发 `clear`。

7.2 The AeroDatePicker 组件 shall 提供 `editable` 属性；为 `true`（默认）时允许键盘输入日期，为 `false` 时输入框只读、仅可通过日历选择。

### Requirement 8: 事件
**Objective:** As a 消费者，I want 日期选择框派发清晰的事件，so that 可响应日期变化与面板展开收起。

#### Acceptance Criteria
8.1 When 选中日期变化，the AeroDatePicker 组件 shall 派发 `update:modelValue` 事件。

8.2 When 选中日期变化，the AeroDatePicker 组件 shall 派发 `change` 事件。

8.3 When 用户点击清空入口，the AeroDatePicker 组件 shall 派发 `clear` 事件。

8.4 When 面板展开/收起，the AeroDatePicker 组件 shall 派发 `visible-change` 事件。

### Requirement 9: 通用弹层定位（usePopper）
**Objective:** As a 组件库维护者，I want 一个通用弹层定位 hook，so that 弹层控件可复用统一的定位与收起逻辑。

#### Acceptance Criteria
9.1 The 组件库 shall 提供通用弹层定位 hook（`usePopper`），供 `AeroDatePicker` 及后续弹层控件复用。

9.2 The usePopper hook shall 在弹层展开时按触发器的位置计算定位，使弹层对齐触发器。

9.3 The usePopper hook shall 在滚动或窗口 resize 时收起弹层，避免弹层错位。

9.4 The AeroDatePicker 组件 shall 使用 `usePopper` 定位其日历面板。

### Requirement 10: 表单上下文集成
**Objective:** As a 消费者，I want `AeroDatePicker` 作为表单控件自动继承表单/表单项级 `size`/`disabled` 并触发即时校验，so that 无需逐控件重复声明即可统一控制与校验。

#### Acceptance Criteria
10.1 While `AeroDatePicker` 位于 `disabled` 的 `AeroForm` 内，the AeroDatePicker 组件 shall 自动进入禁用态，除非自身显式声明 `disabled`。

10.2 While `AeroDatePicker` 位于已声明 `size` 的 `AeroForm` 内，the AeroDatePicker 组件 shall 自动采用表单级尺寸，除非自身显式声明 `size`。

10.3 While `AeroDatePicker` 位于已声明 `size`/`disabled` 的 `AeroFormItem` 内，the AeroDatePicker 组件 shall 优先采用表单项级声明，其次表单级，其次自身默认值。

10.4 When `AeroDatePicker` 位于表单或表单项内，the AeroDatePicker 组件 shall 在 blur/change 时触发所在字段的即时校验。

10.5 While `AeroDatePicker` 位于表单上下文之外，the AeroDatePicker 组件 shall 行为与现状一致（`size`/`disabled` 仅由自身 props 决定，不报错）。

### Requirement 11: 样式与语义 token 约束
**Objective:** As a 组件库维护者，I want 日期选择框样式只消费语义 `--aero-*` 变量并以 BEM 命名，so that 主题与品牌变更无需改动组件即可全局生效，明暗模式自动生效。

#### Acceptance Criteria
11.1 The 组件样式 shall 只引用 `--aero-*` 语义变量，禁止硬编码颜色、间距、圆角等视觉值。

11.2 The 组件样式 shall 禁止直接引用基础色板（例如 `--aero-blue-6` 或 SCSS `$blue-6`）。

11.3 The 组件 DOM 类名 shall 采用 BEM 命名（如 `aero-date-picker`、`aero-date-picker__panel`、`aero-date-table` 与 `is-disabled`/`is-selected`/`is-range` 等状态修饰符）。

11.4 While 根元素应用 `.aero-theme-light` 或 `.aero-theme-dark`，the 组件 shall 自动呈现对应明暗主题的视觉。

### Requirement 12: 类型安全与编码约定
**Objective:** As a 组件库维护者，I want 日期选择框组件严格遵循类型安全与 `<script setup>` 编码约定，so that 组件实现一致、类型可被消费者依赖。

#### Acceptance Criteria
12.1 The 组件实现 shall 使用 `<script setup lang="ts">` 与 `defineProps<T>()`（含 `withDefaults`）、`defineEmits<T>()`，并禁用 Options API。

12.2 The 组件 props/emits 类型（如 `DatePickerProps`、`DatePickerEmits`）shall 定义在 `types.ts` 中，并从 `types.ts` 导出供消费者依赖。

12.3 The 组件类型定义 shall 遵循 TypeScript strict 模式，禁止使用 `any`。

12.4 The 组件 shall 提供共置的单元测试（`__tests__/`），覆盖其 props 行为、单日期/范围选择、面板交互、禁用、格式化、事件、错误态与上下文传递。
