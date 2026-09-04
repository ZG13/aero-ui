# Research & Design Decisions

## Summary
- **Feature**: radio
- **Discovery Scope**: Extension（既有表单控件体系内的新组件，走 light discovery）
- **Key Findings**:
  - 分组模式先例明确：select 的 `provide(selectContextKey)` + Option 注入；radio 沿用但子项自行渲染
  - form 接入契约已稳定：`useFormSize` / `useFormDisabled` + `validate('change')`，全部表单控件一致
  - AeroResolver 为纯自动 kebab 映射，`AeroRadioGroup`/`AeroRadioButton` 会被映射到非真实目录（与 `AeroOption` 同属既有限制），无需在本 spec 解决

## Research Log

### 组件目录与导出契约
- **Context**: 确定 radio 目录结构、index.ts 多组件导出、barrel 登记点
- **Sources Consulted**: `packages/components/select/index.ts`、`packages/components/index.ts`、`packages/index.ts`、`packages/resolver/src/resolver.ts`
- **Findings**:
  - 每个组件一个文件夹，手写 install；select 已示范「一目录多组件导出」模式
  - barrel 需在 `components/index.ts` 与根 `packages/index.ts` 两处登记
  - resolver 自动 kebab 映射无需登记表，`AeroRadio` → `aero-ui/components/radio`
- **Implications**: radio 完全复用 select 的导出与目录模式，无新增约定

### form 上下文契约
- **Context**: 确认 radio 接入 form 的准确接口
- **Sources Consulted**: `packages/components/form/src/use-form.ts`、`form/src/constants.ts`、`select/src/Option.vue`
- **Findings**:
  - `useFormSize(initialSize?)` 优先级：自身 → formItem → form → undefined；`useFormDisabled(initialDisabled?)` 回退 false
  - 校验无事件监听，直接 fire-and-forget `formItemContext?.validate('change')`
  - disabled prop 在 `withDefaults` 中显式 `undefined` 以绕过布尔强转
- **Implications**: radio 接入模式与 InputNumber/Select/DatePicker 完全一致，可脱离表单安全调用

### element-plus radio API 对齐
- **Context**: 确认「完整对齐」的 API 面与 value/label 语义
- **Sources Consulted**: element-plus Radio/RadioGroup/RadioButton 官方文档（2.x）
- **Findings**:
  - `label` 为历史「值」字段，2.6+ 新增 `value` 作为清晰别名，二者语义一致
  - RadioGroup 的 `fill`/`textColor` 仅作用于按钮样式子项；`validateEvent` 控制是否触发表单校验
  - 项目 size 值域为 `large | main | small`（element-plus 用 `default`），按项目约定用 `main`
- **Implications**: `BaseRadioOptionProps` 同时保留 value 与 label，label 标注 deprecated；size 默认 `main`

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 容器 provide context + 子项 inject（选定） | RadioGroup 聚合状态下发，子项自行渲染并回调 changeEvent | 与 select 同构、父子解耦、动态增删子项无注册开销 | 需正确定义 context 契约 | 沿用既有模式 |
| props 下发型分组 | group 通过 props 给每个子项传 checked/disabled | 实现直观 | 失去 fill/textColor 联动、动态增删需遍历插槽，偏离 select 模式 | 拒绝 |
| 纯视觉 div（无原生 input） | 全 div 绘制 | 实现最简 | 无键盘导航、无原生表单语义，违背 a11y 需求 | 拒绝 |

## Design Decisions

### Decision: 透明原生 input 承载键盘与 a11y
- **Context**: 需求 5.1–5.3 要求原生 radio 语义与方向键/空格键操作
- **Alternatives Considered**: 纯 div + 自实现键盘事件；div + 隐藏原生 input
- **Selected Approach**: 视觉层 div 绘制圆点/按钮，底层叠加透明原生 `<input type="radio">`，`name` 透传实现同组键盘导航
- **Rationale**: 原生 radio 天然提供方向键切换、空格键选中与屏幕阅读器语义，无需自实现
- **Trade-offs**: 视觉与语义分离，需注意 input 覆盖层不遮挡点击
- **Follow-up**: 验证 input 透明覆盖层不影响按钮样式子项的可点击区域

### Decision: 子项自行渲染，不设注册表
- **Context**: 与 select 的 addOption/removeOption 是否一致
- **Alternatives Considered**: 仿 select 注册子项数据由容器统一渲染；子项自行渲染
- **Selected Approach**: 子项自行渲染，context 仅下发状态 + changeEvent 回调
- **Rationale**: radio 子项外观由自身决定（圆点 vs 按钮），容器无需渲染子项；注册表在此无用途，符合 Simplification 原则
- **Trade-offs**: context 契约与 select 略有差异，但语义更贴合 radio

### Decision: Radio 与 RadioButton 共享 BaseRadioOptionProps
- **Context**: 二者同为「选项 + 值 + 禁用 + name」的变体
- **Alternatives Considered**: 各自独立定义 props；抽取共享契约
- **Selected Approach**: 抽 `BaseRadioOptionProps`，Radio 增加 border/size/modelValue，RadioButton 增加 modelValue
- **Rationale**: Generalization —— 接口层面复用，避免重复定义漂移
- **Trade-offs**: 增加一层类型间接，但类型层面零成本

## Risks & Mitigations
- resolver 子组件映射（AeroRadioGroup → radio-group 非真实目录）— 与 AeroOption 同属既有限制，记录为 Revalidation Trigger，不在本 spec 解决
- value/label 皆缺省时选中判定退化 — 按 `undefined` 值参与比较（与 select Option 同策略），并补单测覆盖
- 原生 input 透明覆盖层可能影响按钮子项点击 — 用 pointer-events 与视觉层分离处理，测试中覆盖点击行为

## References
- [element-plus Radio 文档](https://element-plus.org/en-US/component/radio.html) — API 与 value/label 语义
- `packages/components/select/` — 分组先例与导出模式
- `packages/components/form/src/use-form.ts` — form 上下文接入契约
