# Requirements Document

## Introduction

本规范（form）的目标是重建 `aero-ui` 组件库的**表单能力**：实现 `AeroForm`（表单容器）与 `AeroFormItem`（表单项）两个可复用组件，使下游应用能以统一方式组织表单、绑定数据模型、展示标签，并处理最繁琐的**字段校验与错误展示**。API 面对齐 element-plus 的 `el-form`/`el-form-item`：支持 `model`/`rules`/`label-width`/`label-position`/`inline`/`size`/`disabled` 等属性；提供声明式校验（`rules` + `prop`）与触发时机（blur/change/submit）；通过表单级上下文向内部控件传递 `size`/`disabled`（需改造现有 `AeroInput` 消费该上下文）。范围仅含 Form + FormItem，不实现表单控件（Select/Checkbox/Radio/Switch）。

## Boundary Context (Optional)

- **In scope**：`AeroForm`、`AeroFormItem` 两个组件及其类型、样式与测试；表单容器（model/rules/布局/size/disabled/校验方法）；表单项（label/prop/必填/错误展示）；声明式校验（required/min/max/pattern/type/validator/asyncValidator 等规则 + 触发时机 + 错误收集）；表单级 `size`/`disabled` 向内部控件的传递（含 `AeroInput` 的消费改造）；组件 barrel 与根 barrel 聚合、`AeroUI` 全局注册；`--aero-*` 语义 token 消费约束；locale 校验文案接入。
- **Out of scope**：表单控件（Select/Checkbox/Radio/Switch 等，属后续 spec）；交互式 playground；SSR/水合相关问题；i18n 运行时高级定制；复杂校验的高级特性（`deepRules`、嵌套数组表单、动态增减表单项）。
- **Adjacent expectations**：`core-components` 已提供 `AeroInput`/`AeroButton`/`AeroIcon`，本 spec 需改造 `AeroInput` 使其能消费表单级 `size`/`disabled` 上下文；`theme` 已提供 `--aero-*` 语义变量与明暗主题，本 spec 仅消费；`i18n` 已提供 `useLocale` 与 `zh-cn`/`en` 语言包骨架，本 spec 补充校验相关文案 key；`resolver` 与 `docs-site` 将在后续接入 `AeroForm`/`AeroFormItem` 的按需导入与双语文档。

## Requirements

### Requirement 1: 组件目录与导出契约
**Objective:** As a 组件库维护者，I want `AeroForm` 与 `AeroFormItem` 遵循「一个组件一个文件夹」结构并导出统一契约，so that 组件可被一致地实现、复用与按需导入。

#### Acceptance Criteria
1.1 The 组件库 shall 以「一个组件一个文件夹」组织 `form` 与 `form-item`，每个组件文件夹包含 `index.ts`、`src/Xxx.vue`、`style/index.scss`、`types.ts` 与 `__tests__/`。

1.2 The 组件库 shall 通过组件 `index.ts` 导出带 `install` 方法的 `AeroForm` 与 `AeroFormItem`，并再导出其 `types.ts` 中的类型。

1.3 The 组件库 shall 使 `AeroForm` 与 `AeroFormItem` 同时支持完整注册（`app.use`）与按需（局部）注册两种导入方式。

1.4 The 组件库 shall 仅在本规范范围内实现 `AeroForm` 与 `AeroFormItem`，不实现 Select/Checkbox/Radio/Switch 等表单控件。

1.5 The 组件库 shall 通过组件 barrel `packages/components/index.ts` 与根 barrel `packages/index.ts` 聚合 re-export `form`/`form-item`，并将 `AeroForm`/`AeroFormItem` 纳入 `AeroUI.install` 的全局注册。

### Requirement 2: AeroForm 表单容器
**Objective:** As a 消费者，I want 一个可复用的 `AeroForm` 表单容器，so that 统一承载数据模型、校验规则、标签布局与尺寸/禁用态，并向内部表单项提供上下文。

#### Acceptance Criteria
2.1 The AeroForm 组件 shall 提供数据模型属性（model），作为整个表单绑定与校验的对象。

2.2 The AeroForm 组件 shall 提供校验规则属性（rules），按字段名声明各字段的校验规则。

2.3 The AeroForm 组件 shall 提供标签宽度（label-width）与标签位置（label-position，left/right/top）属性，控制表单项标签的展示。

2.4 The AeroForm 组件 shall 提供行内布局（inline）属性，支持单行排列表单。

2.5 The AeroForm 组件 shall 提供尺寸（size）与禁用（disabled）属性，作为表单级默认值传递给内部控件。

2.6 The AeroForm 组件 shall 提供是否展示校验消息（show-message）与状态图标（status-icon）属性。

2.7 The AeroForm 组件 shall 提供校验方法（validate），校验全部字段并返回校验结果（成功 resolve，失败 reject 并附带各字段错误信息）。

2.8 The AeroForm 组件 shall 提供按字段校验方法（validateField）、重置方法（resetFields）、清除校验方法（clearValidate）与滚动到错误方法（scrollToField）。

2.9 When 表单校验完成，the AeroForm 组件 shall 触发校验事件（validate），携带字段名、是否通过与错误消息。

### Requirement 3: AeroFormItem 表单项
**Objective:** As a 消费者，I want 一个可复用的 `AeroFormItem` 表单项，so that 组织单个字段的标签、内容与错误展示，并接入表单校验。

#### Acceptance Criteria
3.1 The AeroFormItem 组件 shall 提供字段名属性（prop），用于关联模型字段与校验规则。

3.2 The AeroFormItem 组件 shall 提供标签属性（label），展示字段标签文案。

3.3 The AeroFormItem 组件 shall 提供必填属性（required），在标签旁展示必填星号。

3.4 The AeroFormItem 组件 shall 提供独立校验规则属性（rules）与手动错误信息属性（error）。

3.5 The AeroFormItem 组件 shall 提供标签（label）、默认内容（default）与错误（error）插槽。

3.6 The AeroFormItem 组件 shall 提供校验方法（validate）、重置方法（resetField）与清除校验方法（clearValidate）。

3.7 When 字段校验失败，the AeroFormItem 组件 shall 在字段下方展示错误消息并进入错误态。

### Requirement 4: 表单校验行为
**Objective:** As a 消费者，I want 声明式且完整的表单校验，so that 通过规则声明即可实现必填、长度、格式、自定义校验，并在合适时机触发。

#### Acceptance Criteria
4.1 The 表单校验 shall 支持通过 `rules` 与 `prop` 声明式配置字段校验，规则类型包含必填（required）、最小/最大（min/max）、长度（len）、正则（pattern）、类型（type）等。

4.2 The 表单校验 shall 支持自定义校验函数（validator）与异步校验函数（asyncValidator）。

4.3 The 表单校验 shall 支持校验触发时机（trigger），包含失焦（blur）、变更（change）与提交（submit）场景。

4.4 When 调用 `validate` 校验失败，the 表单校验 shall 以按字段名组织的方式返回各字段的错误信息（含消息与字段名）。

4.5 When 调用 `resetFields`，the 表单校验 shall 将模型恢复至初始值并清除所有字段的校验状态与错误信息。

4.6 When 调用 `clearValidate`，the 表单校验 shall 清除指定字段或全部字段的校验状态与错误信息。

4.7 If 某字段未配置 `prop`，the 表单校验 shall 不将该字段纳入校验与重置范围。

### Requirement 5: 表单级 size/disabled 上下文传递
**Objective:** As a 消费者，I want 表单级尺寸与禁用态自动传递到内部控件，so that 无需逐字段重复声明即可统一控制整表。

#### Acceptance Criteria
5.1 While 某控件位于 `disabled` 的 `AeroForm` 内，the 该控件 shall 自动进入禁用态，除非自身显式声明 `disabled`。

5.2 While 某控件位于 `size` 已声明的 `AeroForm` 内，the 该控件 shall 自动采用表单级尺寸，除非自身显式声明 `size`。

5.3 While 某控件位于已声明 `size`/`disabled` 的 `AeroFormItem` 内，the 该控件 shall 优先采用表单项级声明，其次表单级，其次自身默认值。

5.4 When `AeroInput` 位于表单或表单项内，the AeroInput 组件 shall 消费表单上下文中的 `size`/`disabled`。

### Requirement 6: 样式与语义 token 约束
**Objective:** As a 组件库维护者，I want 表单样式只消费语义 `--aero-*` 变量并以 BEM 命名，so that 主题与品牌变更无需改动组件即可全局生效，明暗模式自动生效。

#### Acceptance Criteria
6.1 The 组件样式 shall 只引用 `--aero-*` 语义变量，禁止硬编码颜色、间距、圆角等视觉值。

6.2 The 组件样式 shall 禁止直接引用基础色板（例如 `--aero-blue-6` 或 SCSS `$blue-6`）。

6.3 The 组件 DOM 类名 shall 采用 BEM 命名（如 `aero-form`、`aero-form-item`、`aero-form-item__label` 与 `is-error` / `is-required` 等状态修饰符）。

6.4 The 错误消息与错误态视觉（边框、文案）shall 使用语义错误 token 呈现。

6.5 While 根元素应用 `.aero-theme-light` 或 `.aero-theme-dark`，the 组件 shall 自动呈现对应明暗主题的视觉。

### Requirement 7: 国际化（locale）支持
**Objective:** As a 组件开发者与消费者，I want 表单校验文案通过 locale 机制获取，so that 错误提示与必填提示等文案随语言自动切换。

#### Acceptance Criteria
7.1 The 表单校验内置错误文案（如必填、长度、格式等默认提示）shall 通过 locale 获取。

7.2 When 当前语言切换，the 表单校验内置错误文案 shall 随语言自动更新。

7.3 The 组件 shall 在语言包中补充并维护表单相关的文案 key（`zh-cn` 与 `en` 各一份）。

### Requirement 8: 类型安全与编码约定
**Objective:** As a 组件库维护者，I want 表单组件严格遵循类型安全与 `<script setup>` 编码约定，so that 组件实现一致、类型可被消费者依赖。

#### Acceptance Criteria
8.1 The 组件实现 shall 使用 `<script setup lang="ts">` 与 `defineProps<T>()`（含 `withDefaults`）、`defineEmits<T>()`，并禁用 Options API。

8.2 The 组件 props/emits 类型与校验规则类型（如 FormRules、FormItemRule）shall 定义在 `types.ts` 中，并从 `types.ts` 导出供消费者依赖。

8.3 The 组件类型定义 shall 遵循 TypeScript strict 模式，禁止使用 `any`；校验规则类型须自建严格类型而不透传弱类型。

8.4 The 每个组件 shall 提供共置的单元测试（`__tests__/`），覆盖其 props 行为、校验行为、事件、错误展示与上下文传递。
