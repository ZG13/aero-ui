# Brief: foundation

## Problem

项目仓库已被清空（commit `ce0cc3e 清空代码仓库`），需要重新搭建一个可构建、可测试、可发布的 Vue 3 + TypeScript 组件库骨架。缺少骨架，后续的主题、组件、国际化、按需导入等工作都无法落地。

## Current State

- 工作目录几乎为空，仅剩 `.kiro/`、`.claude/`、`CLAUDE.md` 和 `base/`（暂存设计 token）。
- git 历史中存在上一版 `ep-craft` 的完整脚手架（package.json、vite.config.ts、tsconfig.json 等），可作为参照。
- steering（product/tech/structure）已存在，需与 `aero-ui` 命名保持一致。

## Desired Outcome

- 一个可直接 `pnpm install && pnpm build` 产出双格式产物（ESM/CJS + d.ts）的空组件库骨架。
- 包名 `aero-ui`、组件前缀 `Aero`、CSS 变量前缀 `--aero-*`。
- 路径别名、exports 映射、lint/format/test/typecheck 脚本齐备。

## Approach

参照上一版 `ep-craft` 的构建方案（Vite 5 library mode + vite-plugin-dts，双格式输出，`preserveModules`），重建并迁移为 `aero-ui` 命名。仅搭建骨架，不实现具体组件。

## Scope

- **In**: package.json（aero-ui）、tsconfig、vite.config、pnpm-workspace、ESLint/Prettier、路径别名（`aero-ui` → `packages/index.ts`）、exports 映射、空入口。
- **Out**: 任何具体组件、主题 token、国际化内容。

## Boundary Candidates

- 构建/发布配置（vite、dts、exports）
- 开发规范工具链（lint、format、test、typecheck）

## Out of Boundary

- 组件实现、主题 token、i18n、resolver、AI 文档。

## Upstream / Downstream

- **Upstream**: 无（首个 spec）。
- **Downstream**: theme、i18n、core-components、resolver 均依赖本 spec 的构建与别名。

## Existing Spec Touchpoints

- **Extends**: 无。
- **Adjacent**: steering（product/tech/structure 需与 `aero-ui` 命名一致）。

## Constraints

- Vue 3.4 + TypeScript strict + Vite 5 + SCSS；pnpm workspace；Node >=18。
- 包名/前缀/token 前缀分别为 `aero-ui` / `Aero` / `--aero-*`。
