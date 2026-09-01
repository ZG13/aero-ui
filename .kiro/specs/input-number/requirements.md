# Requirements Document

## Introduction

本规范（input-number）的目标是在 aero-ui 组件库中新增**数字输入框**能力：实现 `AeroInputNumber` 组件，使下游应用能以受控方式录入数值（数量、价格、评分、步进参数等），支持右侧上下步进按钮、步长（`step`）、边界约束（`min`/`max`）、小数精度（`precision`）、严格步进（`step-strictly`）、禁用（`disabled`）、尺寸（`size`）、只读（`readonly`）、占位文案（`placeholder`）与原生 `name` 透传。API 面对齐 element-plus 的 `el-input-number` 核心与边缘能力（步进按钮仅右侧布局，不实现 `controls-position="outer"`）。作为又一个表单控件，`AeroInputNumber` 消费 `form` spec 已确立的表单上下文契约，自动继承表单/表单项级 `size`/`disabled`，并在 blur/change 时触发字段即时校验。

## Boundary Context (Optional)

- **In scope**：`AeroInputNumber` 组件及其类型、样式与测试；受控数值绑定（`number`）；右侧上下步进按钮（`controls` 控制显隐）；步长、边界、精度、严格步进、禁用、尺寸、只读、占位与 `name` 透传；表单上下文集成（`size`/`disabled` 继承 + blur/change 触发字段即时校验）；组件 barrel 与根 barrel 聚合、`AeroUI` 全局注册；`--aero-*` 语义 token 消费约束；docs-site 中英双语文档 + 内嵌示例。
- **Out of scope**：`controls-position="outer"`（步进按钮在输入框两侧外侧布局）；字符串/大数高精度值（仅 `number` 类型）；自定义步进按钮模板插槽；远程数值来源；其它表单控件（Checkbox/Radio/Switch 等，属后续 spec）。
- **Adjacent expectations**：`form` 已提供表单上下文（`size`/`disabled` 继承 + `validate(trigger)` 即时校验入口），本 spec 消费该契约；`core-components` 已提供 `AeroIcon`（步进三角可复用或 CSS 绘制），本 spec 复用于步进按钮；`theme` 已提供 `--aero-*` 语义变量与明暗主题，本 spec 仅消费；`i18n` 已提供 `useLocale` 与 `zh-cn`/`en` 语言包骨架；`resolver` 的 `kebabCase` 映射已天然支持 `AeroInputNumber`，无需改动；`docs-site` 新增 input-number 双语文档。

## Requirements

### Requirement 1: 组件目录与导出契约
**Objective:** As a 组件库维护者，I want `AeroInputNumber` 遵循「一个组件一个文件夹」结构并导出统一契约，so that 组件可被一致地实现、复用与按需导入。

#### Acceptance Criteria
1.1 The 组件库 shall 以「一个组件一个文件夹」组织 `input-number`，组件文件夹包含 `index.ts`、`src/InputNumber.vue`、`style/index.scss`、`types.ts` 与 `__tests__/`。

1.2 The 组件库 shall 通过组件 `index.ts` 导出带 `install` 方法的 `AeroInputNumber`，并再导出其 `types.ts` 中的类型。

1.3 The 组件库 shall 使 `AeroInputNumber` 同时支持完整注册（`app.use`）与按需（局部）注册两种导入方式。

1.4 The 组件库 shall 仅在本规范范围内实现 `AeroInputNumber`，不实现 `controls-position="outer"`、字符串/大数高精度值、自定义步进模板等高级特性。

1.5 The 组件库 shall 通过组件 barrel `packages/components/index.ts` 与根 barrel `packages/index.ts` 聚合 re-export `input-number`，并将 `AeroInputNumber` 纳入 `AeroUI.install` 的全局注册。

### Requirement 2: 基础数值绑定
**Objective:** As a 消费者，I want 一个受控的数字输入控件，so that 以 `number` 类型绑定并回显当前数值。

#### Acceptance Criteria
2.1 The AeroInputNumber 组件 shall 提供绑定值属性（`model-value`），类型为 `number`，作为受控数值。

2.2 When 用户通过步进按钮或输入改变数值，the AeroInputNumber 组件 shall 更新 `model-value` 并派发 `update:modelValue`。

2.3 When 绑定值为空（`undefined`/`null`），the AeroInputNumber 组件 shall 展示空输入框。

2.4 The AeroInputNumber 组件 shall 仅接受数值输入；非数值字符不被录入。

### Requirement 3: 步进按钮与步长
**Objective:** As a 消费者，I want 右侧上下步进按钮按步长增减数值，so that 无需手动输入即可调整数值。

#### Acceptance Criteria
3.1 The AeroInputNumber 组件 shall 提供步长属性（`step`），默认值为 `1`。

3.2 When 用户点击增加按钮，the AeroInputNumber 组件 shall 将当前值增加一个 `step`；点击减少按钮则将当前值减少一个 `step`。

3.3 When 当前值为空，用户点击步进按钮，the AeroInputNumber 组件 shall 以 `min`（若设置）为起点按 `step` 增减。

3.4 The AeroInputNumber 组件 shall 提供步进按钮显隐属性（`controls`），默认值为 `true`；`controls` 为 `false` 时不显示步进按钮。

3.5 The AeroInputNumber 组件 shall 将步进按钮置于输入框右侧（上下叠放），不实现输入框两侧外侧布局。

### Requirement 4: 边界约束
**Objective:** As a 消费者，I want 数值被约束在 min/max 范围内，so that 不会录入超出业务边界的值。

#### Acceptance Criteria
4.1 The AeroInputNumber 组件 shall 提供最小值属性（`min`）与最大值属性（`max`），默认分别为 `-Infinity` 与 `Infinity`。

4.2 When 步进或输入后的值小于 `min`，the AeroInputNumber 组件 shall 将值修正为 `min`。

4.3 When 步进或输入后的值大于 `max`，the AeroInputNumber 组件 shall 将值修正为 `max`。

4.4 When 值已到达 `min` 或 `max` 边界，the AeroInputNumber 组件 shall 使对应方向的步进按钮进入不可用态。

### Requirement 5: 精度与严格步进
**Objective:** As a 消费者，I want 控制数值的小数精度与步进对齐，so that 数值满足业务精度要求。

#### Acceptance Criteria
5.1 The AeroInputNumber 组件 shall 提供精度属性（`precision`），当设置时控制数值保留的小数位数。

5.2 When `precision` 已设置，the AeroInputNumber 组件 shall 将步进或输入后的值四舍五入到指定小数位数。

5.3 The AeroInputNumber 组件 shall 提供严格步进属性（`step-strictly`），默认值为 `false`。

5.4 When `step-strictly` 为 `true`，the AeroInputNumber 组件 shall 将用户输入的值修正为最接近的 `step` 倍数。

### Requirement 6: 禁用、尺寸与只读
**Objective:** As a 消费者，I want 控制数字输入框的禁用、尺寸与只读状态，so that 适配不同表单场景。

#### Acceptance Criteria
6.1 The AeroInputNumber 组件 shall 提供禁用属性（`disabled`），禁用后不可输入且步进按钮不可用。

6.2 The AeroInputNumber 组件 shall 提供尺寸属性（`size`），支持 `'large' | 'main' | 'small'`，默认 `'main'`。

6.3 The AeroInputNumber 组件 shall 提供只读属性（`readonly`）；只读时禁止键盘输入，但仍允许通过步进按钮改变数值。

### Requirement 7: 占位文案与 name 透传
**Objective:** As a 消费者，I want 设置占位文案与原生 name 属性，so that 空态有提示且表单提交字段名正确。

#### Acceptance Criteria
7.1 The AeroInputNumber 组件 shall 提供占位文案属性（`placeholder`），空态展示该文案。

7.2 The AeroInputNumber 组件 shall 提供 `name` 属性，并将其透传到内部原生输入元素。

### Requirement 8: 事件
**Objective:** As a 消费者，I want 数字输入框派发清晰的事件，so that 可响应数值变化与焦点转移。

#### Acceptance Criteria
8.1 When 数值变化，the AeroInputNumber 组件 shall 派发 `update:modelValue` 事件，携带最新数值。

8.2 When 数值变化，the AeroInputNumber 组件 shall 派发 `change` 事件，携带最新数值。

8.3 When 输入框获得焦点，the AeroInputNumber 组件 shall 派发 `focus` 事件；失去焦点时派发 `blur` 事件。

### Requirement 9: 表单上下文集成
**Objective:** As a 消费者，I want `AeroInputNumber` 作为表单控件自动继承表单/表单项级 `size`/`disabled` 并触发即时校验，so that 无需逐控件重复声明即可统一控制与校验。

#### Acceptance Criteria
9.1 While `AeroInputNumber` 位于 `disabled` 的 `AeroForm` 内，the AeroInputNumber 组件 shall 自动进入禁用态，除非自身显式声明 `disabled`。

9.2 While `AeroInputNumber` 位于已声明 `size` 的 `AeroForm` 内，the AeroInputNumber 组件 shall 自动采用表单级尺寸，除非自身显式声明 `size`。

9.3 While `AeroInputNumber` 位于已声明 `size`/`disabled` 的 `AeroFormItem` 内，the AeroInputNumber 组件 shall 优先采用表单项级声明，其次表单级，其次自身默认值。

9.4 When `AeroInputNumber` 位于表单或表单项内，the AeroInputNumber 组件 shall 在 blur/change 时触发所在字段的即时校验。

9.5 While `AeroInputNumber` 位于表单上下文之外，the AeroInputNumber 组件 shall 行为与现状一致（`size`/`disabled` 仅由自身 props 决定，不报错）。

### Requirement 10: 样式与语义 token 约束
**Objective:** As a 组件库维护者，I want 数字输入框样式只消费语义 `--aero-*` 变量并以 BEM 命名，so that 主题与品牌变更无需改动组件即可全局生效，明暗模式自动生效。

#### Acceptance Criteria
10.1 The 组件样式 shall 只引用 `--aero-*` 语义变量，禁止硬编码颜色、间距、圆角等视觉值。

10.2 The 组件样式 shall 禁止直接引用基础色板（例如 `--aero-blue-6` 或 SCSS `$blue-6`）。

10.3 The 组件 DOM 类名 shall 采用 BEM 命名（如 `aero-input-number`、`aero-input-number__increase`、`aero-input-number__decrease` 与 `is-disabled`/`is-readonly` 等状态修饰符）。

10.4 The 输入框与步进按钮视觉（边框、文本、悬浮态、禁用态）shall 使用语义 token 呈现。

10.5 While 根元素应用 `.aero-theme-light` 或 `.aero-theme-dark`，the 组件 shall 自动呈现对应明暗主题的视觉。

### Requirement 11: 类型安全与编码约定
**Objective:** As a 组件库维护者，I want 数字输入框组件严格遵循类型安全与 `<script setup>` 编码约定，so that 组件实现一致、类型可被消费者依赖。

#### Acceptance Criteria
11.1 The 组件实现 shall 使用 `<script setup lang="ts">` 与 `defineProps<T>()`（含 `withDefaults`）、`defineEmits<T>()`，并禁用 Options API。

11.2 The 组件 props/emits 类型（如 `InputNumberProps`、`InputNumberEmits`）shall 定义在 `types.ts` 中，并从 `types.ts` 导出供消费者依赖。

11.3 The 组件类型定义 shall 遵循 TypeScript strict 模式，禁止使用 `any`。

11.4 The 组件 shall 提供共置的单元测试（`__tests__/`），覆盖其 props 行为、步进/边界/精度/严格步进行为、禁用/只读、事件、错误态与上下文传递。
