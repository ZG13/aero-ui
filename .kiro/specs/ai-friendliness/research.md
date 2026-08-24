# Research & Design Decisions Template

## Summary
- **Feature**: ai-friendliness
- **Discovery Scope**: Simple Addition（扩展既有 spec 契约的纯文档特性）
- **Key Findings**:
  - 上游契约已齐备且唯一权威来源为三份 design.md：core-components（组件目录/导出/props-emits 契约）、theme（`--aero-*` 语义变量与明暗类）、resolver brief（`AeroResolver` 与 `<AeroX />` → `aero-ui/components/x` 按需导入用法）。
  - 仓库当前为空（仅 `base/color.scss`、`base/number.scss`），无既有 `AI_CONTEXT.md` 或 `ai-doc/`；因此本特性为「按 brief 重写」落地为根目录新建，而非迁移旧文件。
  - brief 明确采用「约定 + AI_CONTEXT.md」轻量方案，范围明确排除运行时组件元数据注册与自动化文档生成器。

## Research Log

### 上游契约盘点
- **Context**: 需确认 AI_CONTEXT.md 与 ai-doc 模板引用的组件、token、导入方式均已在上游 spec 确立。
- **Sources Consulted**: `.kiro/specs/core-components/design.md`、`.kiro/specs/theme/design.md`、`.kiro/specs/resolver/brief.md`、`.kiro/steering/{product,tech,structure}.md`
- **Findings**:
  - 组件契约：`AeroButton`（type/size/disabled/loading/icon/nativeType + click）、`AeroInput`（modelValue/placeholder/disabled/clearable/size + update:modelValue/input/change/focus/blur/clear）、`AeroIcon`（name/size/color），每个组件 `index.ts` 导出带 `install` 的组件并再导出 `types.ts`。
  - 语义 token：品牌色 `--aero-primary/success/warning/danger/link-{1..10}`，中性色 `--aero-text/bg/border/fill-*`，非颜色 `--aero-radius/space/font/typography/opacity/stroke/insets-*`；明暗类为 `.aero-theme-light` / `.aero-theme-dark`。
  - 导入方式：完整注册 `app.use`、按需导入 `AeroResolver` + `<AeroX />`、子路径 `aero-ui/components/x`。
  - 禁用项来源：tech.md 明确禁止 Options API、`any`、硬编码视觉值、直接引用基础色板、`.dark`；brief 约束额外禁止 `--ep-*` 等上一版命名。
- **Implications**: AI_CONTEXT.md 各章节内容以三份上游契约为准，禁用 API 清单需覆盖 `--ep-*`、`.dark`、Options API、硬编码值、基础色板、`any`、外部图标库。

### 文件落位决策
- **Context**: brief 未给出 `AI_CONTEXT.md` 与 `ai-doc/` 的绝对路径，需确定落位。
- **Sources Consulted**: brief「Current State」「Desired Outcome」、仓库根目录结构。
- **Findings**: 上一版为根目录 `AI_CONTEXT.md` + `ai-doc/`（button-prompt.md、init.md）；本仓库根目录无既有 AI 文档。
- **Implications**: 落位为根目录 `AI_CONTEXT.md` 与根目录 `ai-doc/`（init.md + button/input/icon 三份 prompt 模板）。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 约定 + AI_CONTEXT.md（选用） | 单一全局上下文文件 + 每组件 prompt 模板，静态 Markdown | 零运行时开销、AI 直接可读、维护成本低 | 文档需随上游契约手工同步 | 与 brief「Approach」一致 |
| 运行时组件元数据注册 | 在组件上挂载元数据供 AI 工具读取 | 元数据与实现同源、不易漂移 | 引入运行时负担、需工具链配合 | 被 brief 明确 Out |
| 自动化文档生成器 | 从源码/类型自动生成 AI 上下文 | 内容始终与实现一致 | 增加构建复杂度与维护成本 | 被 brief 明确 Out |

## Design Decisions

### Decision: 采用「约定 + AI_CONTEXT.md」轻量方案
- **Context**: brief 要求把可确定内容（命名、token、API 规范、禁用项）写成 AI 可读上下文，不引入运行时元数据机制。
- **Alternatives Considered**:
  1. 运行时组件元数据注册
  2. 自动化文档生成器
- **Selected Approach**: 根目录 `AI_CONTEXT.md` 承载全局上下文（导入路径/组件清单/设计 token/代码生成规则/禁用 API 清单），`ai-doc/` 承载组件级 prompt 模板与 init 说明。
- **Rationale**: 内容在上游 spec 已全部确定，静态 Markdown 即可被 Claude Code / Figma MCP 精准读取，无需运行时或构建期额外机制。
- **Trade-offs**: 文档与上游契约为手工同步关系，需依赖本规范的校验任务维持一致。
- **Follow-up**: 实现后校验任务扫描文档无过时 API 且与上游契约一致。

## Risks & Mitigations
- 文档内容与上游 core-components / theme / resolver 契约漂移 —— 通过校验任务比对组件/token 清单与禁用项，与上游 design.md 保持一致。
- 组件 prompt 模板之间重复约定导致维护成本 —— 公共约定收敛到 `AI_CONTEXT.md`，模板只引用并补充组件级契约。
- 禁用 API 清单遗漏上一版命名（如 `--ep-*`）—— 从 brief 约束显式收录进清单。

## References
- `.kiro/specs/core-components/design.md` — 组件目录/导出/props-emits 契约权威来源。
- `.kiro/specs/theme/design.md` — `--aero-*` 语义变量与明暗类契约权威来源。
- `.kiro/specs/resolver/design.md` — 按需导入用法来源。
- `.kiro/steering/tech.md` — 编码约定与禁用项（Options API、`any`、硬编码值、基础色板、`.dark`）。
