# Requirements Document

## Introduction

本规范（foundation）的目标是重建 `aero-ui` 组件库的可构建、可测试、可发布骨架。当前仓库已被清空，仅剩 `.kiro/`、`.claude/`、`CLAUDE.md` 与 `base/`（暂存设计 token），没有任何构建管线、类型检查、工具链或包导出契约。本规范只搭建骨架（脚手架、构建管线、工具链、路径别名、exports 映射、空入口），不实现任何具体组件、主题 token 或国际化内容。

## Boundary Context (Optional)

- **In scope**：package.json（包名 `aero-ui`）、tsconfig、vite.config、pnpm-workspace、ESLint/Prettier、路径别名（`aero-ui` → `packages/index.ts`）、exports 映射、空入口 `packages/index.ts`，以及 lint/format/test/typecheck 脚本。
- **Out of scope**：任何具体组件、主题 token、国际化内容、resolver 实现、AI 文档与文档站。
- **Adjacent expectations**：`theme`、`i18n`、`core-components`、`resolver` 等下游 spec 依赖本 spec 提供的构建契约、路径别名与导出映射；`base/` 目录仅被暂存，其迁移归属 `theme` spec。

## Requirements

### Requirement 1: 项目身份与命名约定
**Objective:** As a 组件库维护者，I want 包名与命名约定在骨架层固化，so that 后续所有 spec 与下游消费者都基于同一套标识。

#### Acceptance Criteria
1.1 The 组件库 shall 以 `aero-ui` 作为 npm 包名。

1.2 The 组件库 shall 以 `Aero` 作为组件前缀（导出命名采用 PascalCase，如 `AeroX`）。

1.3 The 组件库 shall 以 `--aero-*` 作为 CSS 变量前缀。

### Requirement 2: 可构建且可发布的产物管线
**Objective:** As a 组件库维护者，I want 一条可复现的构建命令，so that 能产出可发布的组件库产物。

#### Acceptance Criteria
2.1 When 开发者在 Node >=18、pnpm >=8 环境下执行 `pnpm install`，the 依赖安装流程 shall 成功解析并安装全部依赖。

2.2 When 开发者执行 `pnpm build`，the 构建管线 shall 产出 ESM 与 CJS 双格式产物。

2.3 When 开发者执行 `pnpm build`，the 构建管线 shall 产出与源码结构对应的 `.d.ts` 类型声明。

2.4 When 开发者执行 `pnpm build`，the 构建管线 shall 不将 `vue` 等运行时依赖打包进产物（external 处理）。

2.5 The 构建产物 shall 通过 `files` 与 `exports` 正确描述发布内容，使消费者可按需解析入口。

### Requirement 3: 包导出与模块解析
**Objective:** As a 下游消费者，I want 与发布 specifier 一致的导出与别名，so that 源码内导入与发布后导入行为一致。

#### Acceptance Criteria
3.1 The 组件库 shall 提供 exports 映射，使根入口 `.` 与子路径（`aero-ui/components/*`、`aero-ui/components/*/style/*`、`aero-ui/resolver`、`aero-ui/theme/*`、`aero-ui/locale`、`aero-ui/locale/lang/*`、`aero-ui/hooks`）可被正确解析。

3.2 The 组件库 shall 提供路径别名，使 `aero-ui` 映射到 `packages/index.ts`、`aero-ui/*` 映射到 `packages/*`。

3.3 When 源码使用 `import { AeroX } from 'aero-ui'` 形式导入，the 模块解析 shall 与发布后的 specifier 行为保持一致。

3.4 The 组件库 shall 提供一个空入口（`packages/index.ts`），可被后续 spec 扩展而不改变构建契约。

### Requirement 4: 开发工具链与质量门禁
**Objective:** As a 组件库维护者，I want 齐备的 lint/format/test/typecheck 脚本，so that 代码质量可在本地与 CI 中校验。

#### Acceptance Criteria
4.1 When 开发者执行 `pnpm typecheck`，the 类型检查 shall 在 TypeScript strict 模式下通过。

4.2 When 开发者执行 `pnpm lint`，the ESLint 校验 shall 覆盖 `.vue` 与 `.ts` 源文件。

4.3 When 开发者执行 `pnpm format`，the Prettier 格式化 shall 覆盖 `packages/**/*.{ts,vue,scss}`。

4.4 When 开发者执行 `pnpm test`，the 测试运行器 shall 可正常执行（即使当前无组件用例，亦能通过空测试集）。

### Requirement 5: 边界与依赖约束
**Objective:** As a 组件库维护者，I want 明确本 spec 的范围边界，so that 骨架不与后续组件/主题/国际化工作耦合。

#### Acceptance Criteria
5.1 The 组件库 shall 不在 foundation 阶段实现任何具体组件。

5.2 The 组件库 shall 不在 foundation 阶段迁移或实现主题 token 与国际化内容。

5.3 The 组件库 shall 遵循 pnpm workspace 结构，并声明 Node >=18 与 pnpm >=8 的运行要求。

5.4 Where 下游 spec（theme / i18n / core-components）依赖本 spec，the foundation 骨架 shall 提供稳定的构建与别名契约供其复用。
