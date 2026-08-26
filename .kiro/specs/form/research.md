# Research & Design Decisions

## Summary
- **Feature**: form（`AeroForm` / `AeroFormItem`）
- **Discovery Scope**: Extension（在既有 core-components/theme/i18n/foundation 之上新增表单能力）
- **Key Findings**:
  1. async-validator 是 element-plus/ant-design 共同的校验引擎，但上游已停更 4 年（`4.2.5`，2022-06），MIT license；类型弱（大量 `any`），且**无 `exports` map**，Vite 5 library 构建下若 externalize 会有 ESM/CJS 解析风险。
  2. aero-ui 的 `vite.config.ts` `external` 仅含 `['vue','@vueuse/core','vue-i18n']`，async-validator 不在其中 → 默认被 bundle，**无需改构建配置**，天然规避 ESM/CJS 坑。
  3. element-plus 的 form context 用 Vue `InjectionKey`（Symbol），非字符串 key；size/disabled 继承遵循「自身 → formItem → form」优先级。

## Research Log

### async-validator 引擎选型与构建策略
- **Context**: 需在「完整校验对齐 element-plus」前提下，兼顾 strict/no-any 与 Vite 5 构建。
- **Sources Consulted**: async-validator GitHub / npm（`4.2.5`）、element-plus Form 源码、aero-ui `vite.config.ts`。
- **Findings**:
  - 最新 `4.2.5`（2022-06 停更但稳定、MIT）；无 `exports` map、无 `sideEffects`，仅 `main`/`module` 遗留字段。
  - 类型 `Rules`/`RuleItem` 存在 `any` 与宽松索引签名，不满足 aero-ui strict/no-any。
  - `vite.config.ts` 未将 async-validator 列入 `external` → Rollup 默认 bundle 进 ESM/CJS 产物。
- **Implications**: 采用「引擎 + 自建严格类型封装」—— 公共 `FormRules`/`FormItemRule` 由 aero-ui 定义（no-any），内部做一次适配转成 async-validator 的 `RuleItem`；async-validator **不 externalize（bundle）**，无需改构建配置，仅需在 `package.json` 声明依赖。

### element-plus Form/FormItem API 面与注入模式
- **Context**: 对齐 API 面与上下文传递机制。
- **Sources Consulted**: element-plus 2.14.x Form 文档与源码（`formContextKey`/`formItemContextKey`、`use-form-common-props`）。
- **Findings**:
  - `formContextKey`/`formItemContextKey` 均为 `InjectionKey`（Symbol），非字符串 key。
  - `el-form` 通过 `provide(reactive({ ...toRefs(props), validate, validateField, resetFields, clearValidate, ... }))` 提供 formContext。
  - `el-form-item` inject formContext、provide formItemContext（含 prop/validate/resetField/clearValidate/validateState/validateMessage/size/disabled）。
  - size/disabled 继承：自身 prop → formItem → form → 默认；`useFormSize`/`useFormDisabled` 消费。
- **Implications**: aero-ui 用 Symbol `InjectionKey` + `reactive` context；字段注册用 `addField`/`removeField`（FormItem 挂载时注册、卸载时注销），`validate` 聚合遍历字段调用各 `formItem.validate`。

### 尺寸枚举一致性
- **Context**: `AeroInput` 的 `InputSize = 'large' | 'main' | 'small'`，`AeroButton` 用 `'large' | 'default' | 'small' | 'mini'`，存在既有差异。
- **Findings**: 表单级 size 主要作用于 Input 及未来表单控件，故 `FormSize` 对齐 `InputSize`。
- **Implications**: `FormSize = 'large' | 'main' | 'small'`；Button 尺寸命名不纳入表单 size 继承（Button 非表单控件）。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 单 Form 组件 + 内部 FormItem 子组件 | 一个文件夹内实现两者 | 简单 | 违背「一个组件一个文件夹」+ resolver 需特判 | 否决 |
| form + form-item 两个独立组件文件夹（扁平） | 对齐现有 button/input/icon 结构 | 与 structure.md 一致、resolver 泛型映射自动生效 | 需共享 context 常量模块 | **采纳** |

## Design Decisions

### Decision: async-validator 引擎 + 自建严格类型封装
- **Context**: 完整校验 + strict/no-any。
- **Alternatives Considered**: (1) 直接透传 async-validator `Rules`（any 泄入契约，否决）；(2) 零依赖自研校验调度（高级规则难 100% 对齐，否决）。
- **Selected Approach**: 引入 `async-validator@^4.2.5` 做引擎，aero-ui 定义严格 `FormRules`/`FormItemRule`，`validator.ts` 内部适配转换。
- **Rationale**: 规则语法与 element-plus 一致，迁移成本低；严格类型守住公共契约。
- **Trade-offs**: 引入 stale 依赖 + 一层适配；但 bundle 策略规避 ESM/CJS 坑。
- **Follow-up**: 实现时确认 async-validator 未被任何路径 externalize。

### Decision: 共享 context 常量 + 消费 hook 置于 form 文件夹
- **Context**: form/form-item/input 三者共享 injection key 与继承 hook，需避免循环依赖。
- **Alternatives Considered**: (1) keys 放 `packages/hooks/`（会形成 hooks↔components 双向依赖，否决）；(2) 分散在 form 与 form-item 各自常量（input 需跨包 import form-item，耦合更深）。
- **Selected Approach**: `packages/components/form/src/constants.ts` 放 `formContextKey`/`formItemContextKey` 与 `FormContext`/`FormItemContext` 类型；`packages/components/form/src/use-form.ts` 放 `useFormSize`/`useFormDisabled`。Input 从 form 消费。
- **Rationale**: 依赖方向 input → form，无环；form 是 context 契约的天然 owner。
- **Trade-offs**: Input 依赖 form（可选上下文消费），与 element-plus 一致。
- **Follow-up**: 确认 barrel `export *` 不引入 form↔input 循环。

### Decision: 字段注册/聚合校验机制
- **Context**: Form 的 `validate` 需聚合所有 FormItem 的校验结果。
- **Selected Approach**: FormItem 挂载时 `addField`、卸载时 `removeField`；Form 持有 `fields: FormItemContext[]`；`validate`/`validateField` 遍历调用各 `formItem.validate`。
- **Rationale**: 与 element-plus 一致，字段级校验状态收敛于 FormItem。

## Risks & Mitigations
- async-validator 停更 → 已被海量项目验证稳定；bundle 进产物避免外部解析问题。
- async-validator 类型 `any` → 自建严格类型层，`validator.ts` 内部做受控 `as` 边界，公共契约 no-any。
- 表单级 size/disabled 继承需改 Input → 优先级明确（自身→formItem→form），默认值兜底，向后兼容（无上下文时行为不变）。
- 校验默认文案 i18n → 补 `zh-cn`/`en` 的 `components.form.rules.*` 默认消息 key。

## References
- [async-validator GitHub](https://github.com/react-component/async-validator) — 校验引擎
- [element-plus Form 文档](https://element-plus.org/en-US/component/form) — API 面与注入模式
