# Brief: ai-friendliness

## Problem

本组件库定位为「AI 友好型」：使用该组件库配合 AI 开发应更便捷。需要一套确定性编码约定 + 一份可供 AI（Claude Code / Figma MCP）精准读取的 `AI_CONTEXT.md`，让 AI 生成组件代码时不需猜测。

## Current State

- 上一版已有 `AI_CONTEXT.md` + `ai-doc/`（button-prompt.md、init.md），可参照其结构。
- 当前无 AI 相关文档。

## Desired Outcome

- 重写 `AI_CONTEXT.md`（迁移为 aero-ui / Aero / `--aero-*`），含导入路径、组件清单、设计 token 变量、代码生成规则、禁用 API 清单。
- `ai-doc/` 存放组件级 prompt 模板与初始化说明，指导 AI 按规范生成代码。

## Approach

采用「约定 + AI_CONTEXT.md」轻量方案：把可确定的内容（命名、token、API 规范、禁用项）写成 AI 可读的上下文与 prompt 模板；不引入额外运行时元数据机制。

## Scope

- **In**: AI_CONTEXT.md、ai-doc prompt 模板、代码生成规则文档、禁用 API 清单。
- **Out**: 运行时组件元数据注册、自动化文档生成器。

## Boundary Candidates

- AI_CONTEXT.md（全局上下文）
- ai-doc/（组件级 prompt 模板）

## Out of Boundary

- 组件实现、主题、i18n、resolver 实现本身。

## Upstream / Downstream

- **Upstream**: core-components（记录已确立的组件规范）。
- **Downstream**: 后续组件 spec 复用其 prompt 模板。

## Existing Spec Touchpoints

- **Extends**: 无。
- **Adjacent**: core-components（规范来源）、theme（token 约定）、resolver（按需导入用法）。

## Constraints

- 内容需与 aero-ui / Aero / `--aero-*` 保持一致；禁止 `--ep-*`、`.dark` 等过时 API。
