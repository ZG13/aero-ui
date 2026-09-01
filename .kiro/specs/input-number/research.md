# Research & Design Decisions

## Summary
- **Feature**: input-number
- **Discovery Scope**: Extension（轻量 discovery）
- **Key Findings**:
  - `form` 已提供 `useFormSize`/`useFormDisabled` + `formItemContextKey.validate(trigger)` 完整契约，`AeroInputNumber` 直接复用，无需新基础设施。
  - `AeroSelect` 已确立表单控件范式（组件目录/类型/样式/测试 + 表单集成），作为本 spec 的参照样板。
  - 数值逻辑（clamp/精度/step 对齐/步进）可抽为纯函数模块，独立单测，避免与 Vue 组件耦合。

## Research Log

### 表单上下文契约
- **Context**: 确认 `AeroInputNumber` 消费 form 上下文的准确 API。
- **Sources Consulted**: `packages/components/form/src/use-form.ts`、`packages/components/form/src/constants.ts`、`packages/components/form/types.ts`。
- **Findings**: `useFormSize(initialSize?)` / `useFormDisabled(initialDisabled?)` 返回 `ComputedRef`；`FormItemContext.validate(trigger?)` 返回 `Promise<FieldError[]>`，blur/change 即时校验 resolve 不 reject；`FormSize = 'large' | 'main' | 'small'`。
- **Implications**: 组件复用这两个 hook + `formItemContextKey`，与 Input/Select 同一路径，无契约改动。

### 步进三角渲染
- **Context**: 步进按钮三角图标实现方式。
- **Sources Consulted**: `packages/components/select/style/index.scss` 的 `.aero-select__arrow`（CSS 三角）。
- **Findings**: Select 已用 CSS border 三角绘制箭头，无需 SVG 图标。
- **Implications**: 步进按钮复用 CSS 三角做法，不扩 `AeroIcon` 图标集，减少跨 spec 依赖。

### 输入态分离
- **Context**: 如何避免输入过程被 `precision`/`step` 强制格式化打断（如输入 `1.` 被四舍五入）。
- **Sources Consulted**: element-plus `el-input-number` 的 `userInput` 处理思路（本地知识）。
- **Findings**: 内部维护字符串 `displayValue` 承载输入态，失焦/Enter 时解析提交，非法回退。
- **Implications**: 引入 `displayValue` 状态，受控值仍完全由 `modelValue` 驱动，符合 steering「受控组件」约束。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 单组件内联数值逻辑 | 算法写在 InputNumber.vue | 简单直接 | 难单测、易臃肿 | 不采用 |
| 纯函数模块 number.ts | 数值算法抽为独立模块 | 可独立单测、无 Vue 耦合 | 多一个文件 | **采用** |

## Design Decisions

### Decision: 数值逻辑抽为纯函数模块
- **Context**: 步进/clamp/精度/step 对齐是纯计算，与 UI 无关。
- **Alternatives Considered**: (1) 内联在组件； (2) 抽 `src/number.ts`。
- **Selected Approach**: 抽 `src/number.ts`。
- **Rationale**: 纯函数可独立单测，边界/精度断言不依赖 DOM。
- **Trade-offs**: 多一个文件；换取更高的可测性与可读性。
- **Follow-up**: 实现时保持函数无副作用、无 Vue import。

### Decision: 步进三角用 CSS 绘制
- **Context**: 步进按钮三角图标来源。
- **Alternatives Considered**: (1) 扩 `AeroIcon` 图标集； (2) CSS 三角。
- **Selected Approach**: CSS 三角。
- **Rationale**: 与 Select 的箭头做法一致，避免为两个三角扩图标集。
- **Trade-offs**: 三角不可自定义；换取零跨 spec 依赖。
- **Follow-up**: 明暗主题下用 `--aero-*` token 控制三角颜色。

## Risks & Mitigations
- 输入态与受控值脱节 → 用 `displayValue` 分离 + 失焦回退，非法输入不污染 `modelValue`。
- `precision`/`step` 组合的舍入顺序不一致 → 统一「先 clamp 后 toPrecision」，并在 number.test.ts 覆盖组合断言。

## References
- element-plus `el-input-number`（本地知识，用于对齐 API 语义与输入态处理）。
