# Research & Design Decisions

## Summary
- **Feature**: select（AeroSelect + AeroOption 下拉选择）
- **Discovery Scope**: Extension（表单控件，消费 form 既有上下文契约）
- **Key Findings**:
  1. `AeroInput` 已确立「表单控件消费 form 上下文」的完整范式（inject `formItemContextKey` + `useFormSize`/`useFormDisabled` + blur/change 触发 `formItemContext.validate(trigger)`），Select 可直接复用 `packages/components/form/src/use-form.ts` 的 hook，无需重造。
  2. `AeroIcon` 仅有 5 个图标（search/close/loading/settings/link），无下拉箭头；清空/多选删除复用 `close`，下拉箭头需 CSS 绘制。
  3. `AeroResolver` 的 `kebabCase` 已自动把 `AeroSelect`/`AeroOption` 映射到 `aero-ui/components/select`，无需改动。
  4. 语义 token 完整（`--aero-border-*`/`--aero-radius-*`/`--aero-text-*`/`--aero-space-*`/`--aero-bg-*`/`--aero-danger-*`），支撑弹层样式。

## Research Log

### 表单上下文契约（form spec 已确立）
- **Context**: Select 需接入 size/disabled 继承与即时校验，需确认 form 已暴露的契约形状。
- **Sources Consulted**: `packages/components/form/src/constants.ts`、`src/use-form.ts`、`packages/components/input/src/Input.vue`。
- **Findings**:
  - `useFormSize(initialSize?)` 与 `useFormDisabled(initialDisabled?)` 是通用 hook，内部 `inject(formContextKey)`/`inject(formItemContextKey)`，按「自身 → 表单项 → 表单 → 默认」折叠；在表单上下文之外安全返回回退值。
  - `FormItemContext.validate(trigger?: 'blur'|'change'|'submit')` 为字段级即时校验入口；blur/change 触发时作为 fire-and-forget 副作用调用（resolve 不 reject），无需 await/catch。
  - `FormSize = 'large' | 'main' | 'small'`，与 `InputSize` 同值。
- **Implications**: Select 的 `size` 复用 `FormSize` 语义；`disabled` 显式默认 `undefined` 以绕过 Vue 布尔 prop 的「未声明→false」强转；blur/change 时调用 `formItemContext?.validate('blur'/'change')`。

### 选项收集机制
- **Context**: `AeroOption` 声明选项，`AeroSelect` 需收集其下的所有 Option。
- **Sources Consulted**: 现有 `form` 的 provide/inject 范式、element-plus el-select 的选项收集思路。
- **Findings**: 父（Select）provide 一个 Symbol key 的「选项注册上下文」，子（Option）inject 并在挂载时注册、卸载时注销，是 Vue 中父收集子节点元数据的标准做法。
- **Implications**: 新增 `selectContextKey`（Symbol）承载 `addOption/removeOption` 与选项数组；Option 不直接依赖 Select 实例，只依赖注入的 key。

### 弹层方案（build vs adopt）
- **Context**: 下拉面板的定位与外部点击关闭。
- **Sources Consulted**: tech.md（未列浮层库）、brief.md 方案对比。
- **Findings**: 项目定位「零浮层依赖、AI 友好可控」；表单内下拉无复杂 overflow/碰撞场景。
- **Implications**: 自研 teleport + 绝对定位 + document click-outside + Escape 关闭；不引入 @floating-ui 等依赖。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 自研 teleport 弹层 | teleport 到 body + 绝对定位 + 手动 click-outside/Escape | 零新依赖、可控、符合 AI 友好 | 需手写定位与滚动态 | **已选** |
| @floating-ui | 引入浮层库处理翻转/碰撞 | 定位健壮 | 新依赖、违背轻量定位 | 拒绝 |

## Design Decisions

### Decision: 复用 form 的 useFormSize/useFormDisabled，不重造
- **Context**: Select 需要 size/disabled 继承。
- **Alternatives Considered**: (1) 新建 select 专属 useSelectSize/useSelectDisabled；(2) 直接复用 form 的 `use-form.ts`。
- **Selected Approach**: 复用 `use-form.ts` 的 `useFormSize`/`useFormDisabled`。
- **Rationale**: 两者已是通用 hook，无表单特定耦合；Input 已先例。避免重复实现（simplification 原则）。
- **Trade-offs**: select 对 form 模块产生源码级依赖（import `../../form/src/use-form`），但方向正确（控件 → form），与 Input 一致。
- **Follow-up**: 实现时确认 import 路径与 Input 一致。

### Decision: 下拉箭头用 CSS 绘制，不新增图标资产
- **Context**: `AeroIcon` 无 chevron 图标。
- **Alternatives Considered**: (1) 向 AeroIcon 新增 chevron/arrow-down 图标；(2) CSS 三角/旋转边框。
- **Selected Approach**: CSS 绘制（border 三角，`currentColor`）。
- **Rationale**: 不改动 core-components 的 Icon 资产，避免跨 spec 改动；颜色跟随文本 token 自动适配明暗。
- **Trade-offs**: CSS 三角视觉上比 SVG 图标稍简；可接受。
- **Follow-up**: 展开态旋转箭头（`.is-open` 修饰符）。

## Risks & Mitigations
- 弹层定位在滚动/缩放时偏移 —— 收起时销毁面板 + 打开时按 getBoundingClientRect 重新定位；滚动/窗口 resize 时收起。
- 多选回显 label 与 value 失配（value 不在 options 中）—— 找不到匹配 label 时回退展示 value 字符串。
- 表单集成漏触发校验 —— 单测覆盖「在 FormItem 内 blur/change 触发 validate」。

## References
- `packages/components/form/src/use-form.ts` — size/disabled 继承 hook（复用对象）
- `packages/components/input/src/Input.vue` — 表单控件消费上下文的参考实现
- element-plus `el-select`/`el-option` — API 对齐参照
