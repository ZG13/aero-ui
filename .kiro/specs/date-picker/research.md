# Research & Design Decisions

## Summary
- **Feature**: date-picker
- **Discovery Scope**: Extension（轻量 discovery + 新依赖调研）
- **Key Findings**:
  - `select` 已内嵌弹层定位（panelStyle + updatePanelPosition + click-outside + Escape + 滚动收起），本 spec 将其抽为通用 `usePopper`，避免 date-picker 重复造轮子。
  - `form` 的 `useFormSize`/`useFormDisabled` + `formItemContextKey.validate` 契约完备，date-picker 直接复用。
  - 项目当前无日期库，引入 `dayjs`（element-plus 同款）处理解析/格式化/月历。

## Research Log

### dayjs 集成
- **Context**: 日期解析/格式化/月历生成的库选型。
- **Sources Consulted**: element-plus 依赖（本地知识）、dayjs 官方 API（本地知识）。
- **Findings**: dayjs 轻量（2KB）、API 与 element-plus 一致（`dayjs(value)` / `.format(fmt)` / `.startOf('month')` / `.add(1, 'month')`），支持 `Date`/`string`/`number` 入参。
- **Implications**: 引入 `dayjs`（^1.11.x），构建时外部化（对齐 @vueuse/core），组件经 `date.ts` 薄封装避免散落 dayjs 调用。

### usePopper 抽取
- **Context**: 弹层定位逻辑复用。
- **Sources Consulted**: `packages/components/select/src/Select.vue` 的定位实现。
- **Findings**: select 已实现 fixed + getBoundingClientRect 定位 + click-outside + Escape + scroll/resize 收起，逻辑完整但内嵌。
- **Implications**: 抽为 `packages/hooks/use-popper.ts`，date-picker 首个消费者；select 回填为独立非阻塞优化（不在本 spec）。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| usePopper 内嵌 date-picker | 定位逻辑写在组件内 | 简单 | 与 select 重复，未来 time-picker 再复制 | 不采用 |
| 抽通用 usePopper hook | 定位逻辑抽 hooks | 可复用、select 可回填 | 需定通用契约 | **采用** |

## Design Decisions

### Decision: 引入 dayjs 并薄封装为 date.ts
- **Context**: 日期解析/格式化/月历需要成熟库。
- **Alternatives Considered**: (1) 手写日期处理； (2) 引入 dayjs。
- **Selected Approach**: 引入 dayjs + `date.ts` 薄封装。
- **Rationale**: dayjs 轻量可靠、API 对齐 element-plus；薄封装隔离库依赖便于替换。
- **Trade-offs**: 新增一个依赖；换取正确性与可维护性。
- **Follow-up**: 构建 external 化 dayjs；`date.test.ts` 覆盖月历/范围边界。

### Decision: 抽 usePopper 而非回填 select
- **Context**: 弹层定位复用与范围控制。
- **Alternatives Considered**: (1) 本 spec 回填 select； (2) 仅 date-picker 用 usePopper，select 后续回填。
- **Selected Approach**: date-picker 用 usePopper，select 回填列为非阻塞后续。
- **Rationale**: 避免范围蔓延（本 spec 不触碰 select），降低回归风险。
- **Trade-offs**: select 暂时保留手写定位；换取本 spec 边界清晰。
- **Follow-up**: select 回填时重新校验 select 集成。

## Risks & Mitigations
- 时区/格式歧义 → 统一用 dayjs 对象计算，仅在派发时序列化。
- 范围选择两段式状态管理复杂 → 用 `rangeState: [Dayjs|null, Dayjs|null]` 显式建模，覆盖「结束早于起始」用例。

## References
- element-plus `el-date-picker`（本地知识，用于对齐 API 语义与范围选择交互）。
- dayjs 官方文档（本地知识，用于解析/格式化/月历 API）。
