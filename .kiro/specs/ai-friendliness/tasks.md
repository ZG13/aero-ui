# Implementation Plan

## Task Format Template

> **Parallel marker**：`(P)` 表示该任务与紧邻的前序任务无依赖，可并发执行。跨边界依赖用 `_Depends:` 显式声明；`_Boundary:` 标注文档边界。

- [x] 1. 编写 AI_CONTEXT.md 全局上下文
- [x] 1.1 建立 AI_CONTEXT.md 骨架与项目定位章节
  - 在仓库根目录创建 `AI_CONTEXT.md`，写入项目定位（aero-ui / Aero / `--aero-*`）与五大章节的结构总览
  - 完成后文件存在且全篇不含 `--ep-*`、`.dark` 等过时 API 字样
  - _Requirements: 1.1_
- [x] 1.2 编写导入路径章节
  - 写入完整注册（`app.use`）、按需导入（`AeroResolver` + `<AeroX />`）与子路径导入（`aero-ui/components/x`）三类用法与示例
  - 完成后三种导入方式均有示例，且按需导入用法与 resolver 契约一致
  - _Requirements: 1.2_
- [x] 1.3 编写组件清单章节
  - 列出 AeroButton / AeroInput / AeroIcon 及各自 props / emits 契约要点
  - 完成后组件清单与 core-components 的 props / emits 契约一致
  - _Requirements: 1.3_
- [x] 1.4 编写设计 token 变量章节
  - 写入 `--aero-*` 语义变量类别（品牌色、中性色、非颜色语义）与命名约定，以及 `.aero-theme-light` / `.aero-theme-dark` 明暗类
  - 完成后 token 说明与 theme 语义变量契约一致
  - _Requirements: 1.4_
- [x] 1.5 编写代码生成规则章节
  - 写入 `<script setup lang="ts">` + `defineProps<T>`（含 `withDefaults`）+ `defineEmits<T>`、`types.ts` 承载类型、BEM 类名、只消费 `--aero-*`、「一个组件一个文件夹」
  - 完成后规则覆盖全部编码约定，与 tech.md / structure.md 一致
  - _Requirements: 2.1, 2.2, 2.3, 2.4_
- [x] 1.6 编写禁用 API 清单章节
  - 写入 `--ep-*`、`.dark`、Options API、硬编码视觉值、基础色板引用（`--aero-blue-*` / `$blue-*`）、`any`、外部图标库等禁用项
  - 完成后清单覆盖全部禁用项，且文档其余章节无这些禁用项
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2. 编写 ai-doc 组件级 prompt 模板
- [x] 2.1 (P) 编写 AeroButton prompt 模板
  - 在 `ai-doc/` 下创建 `button-prompt.md`，含目标、ButtonProps / ButtonEmits 契约、`--aero-*` token 用法与代码生成规则指引
  - 完成后模板的 props / emits 与 core-components Button 契约一致，且公共约定引用 AI_CONTEXT.md
  - _Requirements: 4.1, 4.2, 4.3_
  - _Boundary: button-prompt_
- [x] 2.2 (P) 编写 AeroInput prompt 模板
  - 在 `ai-doc/` 下创建 `input-prompt.md`，含目标、InputProps / InputEmits 契约、`--aero-*` token 用法与代码生成规则指引
  - 完成后模板的 props / emits 与 core-components Input 契约一致，且公共约定引用 AI_CONTEXT.md
  - _Requirements: 4.1, 4.2, 4.3_
  - _Boundary: input-prompt_
- [x] 2.3 (P) 编写 AeroIcon prompt 模板
  - 在 `ai-doc/` 下创建 `icon-prompt.md`，含目标、IconProps 契约、`--aero-*` token 用法与代码生成规则指引
  - 完成后模板的 props 与 core-components Icon 契约一致，且公共约定引用 AI_CONTEXT.md
  - _Requirements: 4.1, 4.2, 4.3_
  - _Boundary: icon-prompt_

- [x] 3. 编写 ai-doc 初始化说明
- [x] 3.1 编写 init.md 初始化说明
  - 在 `ai-doc/` 下创建 `init.md`，说明 AI_CONTEXT.md 是全局入口、`ai-doc/*-prompt.md` 是组件模板，并覆盖 Claude Code 与 Figma MCP 两种读取方式与模板选择指引
  - 完成后初始化说明覆盖两种使用方式，并指向正确的模板文件
  - _Requirements: 5.1, 5.2_
  - _Depends: 1.1, 2.1, 2.2, 2.3_

- [x] 4. 一致性与范围校验
- [x] 4.1 校验文档与上游契约一致且无禁用项
  - 扫描 `AI_CONTEXT.md` 与 `ai-doc/`，断言无 `--ep-*`、`.dark`、Options API 字样；组件清单与 core-components 契约一致、token 清单与 theme 契约一致、导入用法与 resolver 用法一致
  - 完成后扫描无违规项，文档无过时 API，组件 / token / 导入内容与上游一致
  - _Requirements: 1.1, 1.5, 3.1, 3.2, 4.3_
- [x] 4.2 校验轻量方案范围：仅产出文档
  - 确认工作树仅新增 `AI_CONTEXT.md` 与 `ai-doc/` 文档，无组件/主题/i18n/resolver 代码改动，无构建配置改动
  - 完成后无运行时组件元数据注册或自动化文档生成器引入
  - _Requirements: 6.1, 6.2_
