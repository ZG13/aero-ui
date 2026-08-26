# Brief: form

## Problem

aero-ui 目前只有 Button、Input、Icon 三个原子组件，缺少**表单容器与表单项**这一层组织能力。下游应用要做表单时，需要自行处理 `model` 绑定、`label` 布局、尺寸/禁用态统一传递，以及最繁琐的**字段校验与错误展示**。参考 element-plus 的 `el-form`/`el-form-item` 是业界共识形态，把它封装成 `aero-form` 能显著降低表单开发成本，并补齐组件库在「表单」这一高频场景的空白。

## Current State

- 已有三个核心组件（Button/Input/Icon），遵循统一目录/类型/样式/测试规范（`packages/components/*/`）。
- 已有 theme（`--aero-*` 语义 token）、i18n（zh-cn/en）、resolver（按需导入）、docs-site（中英双语文档站）基础设施。
- `Input` 目前**未消费**任何外部 context，`size`/`disabled` 只由自身 props 决定；要支持「表单级统一传递」，需要给现有 Input 增加对 form context 的消费能力。
- 项目尚无表单校验相关能力，也没有 `async-validator` 依赖。

## Desired Outcome

- 提供 `AeroForm`（表单容器）与 `AeroFormItem`（表单项），API 面对齐 element-plus：`model`/`rules`/`label-width`/`label-position`/`inline`/`size`/`disabled` 等 props。
- 提供完整校验能力：声明式 `rules` + `prop`，支持 `required`/`min`/`max`/`pattern`/`type`/`validator`/`asyncValidator`，触发时机 `blur`/`change`/`submit`，以及 `validate`/`validateField`/`resetFields`/`clearValidate`/`scrollToField` 方法。
- `Form`/`FormItem` 通过 `provide/inject`（Symbol key）传递 context，使内部控件能自动继承表单级 `size`/`disabled`；`Input` 改造为消费该 context。
- 校验错误文案走 i18n（zh-cn/en），错误态通过 `--aero-*` token 呈现。
- 组件在 resolver 与 docs-site 中注册，文档站新增 form 的双语文档 + 内嵌示例。

## Approach

**Approach 1 — async-validator 引擎 + 自研严格类型封装**（已确认）。

引入 `async-validator@4.2.5` 作为校验引擎，规则语法与 element-plus 完全一致（开发者可平滑迁移）。但因其上游类型弱（`Rules`/`RuleItem` 含大量 `any`），aero-ui 自定一套严格的 `FormRules`/`FormItemRule` 公共类型（JSDoc 完整、no-any），内部做一次类型适配转换后再交给 async-validator 执行。构建时对 async-validator **不 externalize（bundle 进产物）**，规避其无 `exports` map 导致的 ESM/CJS 解析坑。`Form`/`FormItem` 用 Vue `InjectionKey`（Symbol）传递 `formContext`/`formItemContext`，对齐 element-plus 的注入模式；`size`/`disabled` 继承走 `useFormSize`/`useFormDisabled` 类 hook。

## Scope

- **In**:
  - `AeroForm`：`model`、`rules`、`label-width`、`label-position`（`left`/`right`/`top`）、`label-suffix`、`inline`、`size`、`disabled`、`show-message`、`status-icon`、`scroll-to-error` 等 props；`validate`/`validateField`/`resetFields`/`clearValidate`/`scrollToField` 方法；`validate` 事件。
  - `AeroFormItem`：`prop`、`label`、`required`、`rules`、`error`、`show-message`、`size` 等 props；`label`/`default`/`error` 插槽；`validate`/`resetField`/`clearValidate` 方法；错误态与必填星号展示。
  - 校验层：async-validator 引擎 + 严格类型封装 + 触发时机调度 + 错误收集（reject 形状对齐 element-plus 的 `ValidateFieldsError`）。
  - 上下文传递：`formContextKey`/`formItemContextKey`（Symbol）+ `useFormSize`/`useFormDisabled` hook；改造现有 `Input` 消费注入的 `size`/`disabled`。
  - 类型：`types.ts` 导出 `FormProps`/`FormItemProps`/`FormRules`/`FormItemRule`/`FormEmits` 等，JSDoc `@default` 齐全。
  - 测试（`__tests__/*.test.ts`）、resolver 注册、i18n 文案、docs-site 双语文档 + 内嵌示例。

- **Out**:
  - 表单控件（Select/Checkbox/Radio/Switch 等）—— 后续 spec，本 spec 仅做容器与表单项。
  - 交互式 playground；SSR/水合相关问题；i18n 运行时高级定制。

## Boundary Candidates

- **表单容器层**：`model`/`rules`/布局/校验方法/context 提供方。
- **表单项层**：`label`/`prop`/必填/错误展示/context 消费与提供方。
- **校验引擎层**：async-validator 适配 + 严格类型封装 + 触发调度。
- **上下文传递层**：Symbol injection key + `useFormSize`/`useFormDisabled` hook，以及 Input 的消费改造。

## Out of Boundary

- 表单控件（Select/Checkbox/Radio/Switch）—— 交由后续 spec，本 spec 仅确立 FormItem 对子控件的 context 契约（未来控件据此接入校验与 size/disabled 继承）。
- 复杂校验规则的高级特性（`deepRules`、嵌套数组表单、动态增减表单项）—— 本 spec 只对齐 element-plus 常规校验面。

## Upstream / Downstream

- **Upstream**: `core-components`（复用 Input/Button/Icon，并改造 Input 消费 context）、`theme`（错误态/边框/文本 token）、`i18n`（校验文案 zh-cn/en）、`foundation`（构建管线，含 async-validator bundle 策略）。
- **Downstream**: 未来的表单控件 spec（会消费本 spec 定义的 `formItemContext` 以接入校验与 size/disabled 继承）；下游应用直接使用 `aero-form`。

## Existing Spec Touchpoints

- **Extends**: `core-components` —— 对 `Input` 增加 form context 消费（`useFormSize`/`useFormDisabled`），使其支持表单级 size/disabled 继承。
- **Adjacent**: `resolver`（需注册 `AeroForm`/`AeroFormItem`）、`docs-site`（新增 form 双语文档）、`i18n`（新增表单校验相关文案）。

## Constraints

- Vue 3.4 + TypeScript（strict，no-any）+ Vite 5 + SCSS；组件仅用 `<script setup lang="ts">` + `defineProps<T>()`，props/types 放同级 `types.ts`。
- 组件只消费语义 `--aero-*` 变量，禁止硬编码与直接引用基础色板。
- async-validator 采用 **bundle（不 externalize）** 策略，规避其无 `exports` map 的 ESM/CJS 解析问题；公共类型自包严格封装，禁止 `any` 泄入契约。
- context 传递用 Vue `InjectionKey`（Symbol），禁止字符串 key。
- 校验文案走 i18n；错误态、必填星号、尺寸复用既有语义 token。
