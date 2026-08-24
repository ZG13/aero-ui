# 初始化说明（ai-doc）

本目录为 AI 助手提供 `aero-ui` 的组件生成提示词素材。

## 文件结构

- 全局上下文入口：仓库根目录 `AI_CONTEXT.md` —— 导入路径、组件清单、设计 token、代码生成规则、禁用 API 清单（公共约定只在此定义一次）。
- 组件级 prompt 模板：本目录下 `button-prompt.md` / `input-prompt.md` / `icon-prompt.md` —— 各组件 props/emits 契约、`--aero-*` token 用法与代码生成规则指引。
- 本文件（`init.md`）：加载与选模板指引。

## 使用方式

### Claude Code

1. 将仓库根目录 `AI_CONTEXT.md` 作为项目上下文文件加载（项目启动时随上下文注入）。
2. 生成**现有组件**（如 `AeroButton`）时，读取对应 `ai-doc/button-prompt.md` 作为任务上下文。
3. 生成**同类新组件**（如 `AeroTag`）时，以任一组件模板为样板，套用 `AI_CONTEXT.md` 的公共约定。

### Figma MCP

1. 将 `AI_CONTEXT.md` 内容作为提示词素材注入 Figma 设计转代码的生成流程。
2. 依据目标组件（Button / Input / Icon）选取对应的 `ai-doc/*-prompt.md` 作为组件级约束。
3. 生成产物遵循 `AI_CONTEXT.md` 的「代码生成规则」与「禁用 API 清单」。

## 模板选择指引

| 场景 | 选用素材 |
|------|----------|
| 生成 `AeroButton` | `ai-doc/button-prompt.md` |
| 生成 `AeroInput` | `ai-doc/input-prompt.md` |
| 生成 `AeroIcon` | `ai-doc/icon-prompt.md` |
| 生成新组件 | 任一同类模板 + `AI_CONTEXT.md` 公共约定 |

> 生成组件时应以 `AI_CONTEXT.md` 为准的公共约定（编码规则、禁用项）为最高优先级；组件模板仅补充该组件专属的 props/emits 与 token 用法。
