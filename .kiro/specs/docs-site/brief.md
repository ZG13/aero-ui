# Brief: docs-site

## Problem

组件库需要一个面向使用者的文档站点，让开发者能查看每个组件的用法示例与 API 说明，形态类似 element-plus 的组件示例网站。

## Current State

- 上一版 ep-craft 已有 VitePress 双语文档站（`docs/` 中文 + `docs/en/` 英文镜像），可参照。
- 上一版 package.json 有 `docs:dev` / `docs:build` / `docs:preview` 脚本，需在 foundation 阶段重建。
- 当前无文档站。

## Desired Outcome

- 基于 VitePress 的组件文档站，中英双语镜像（`docs/zh-CN/` 与 `docs/en-US/`）。
- 每个组件独立一份文档（`button.md`、`input.md`、`icon.md`）。
- 示例代码以 markdown 内嵌代码块展示。
- 左侧导航、首页、明暗主题切换等 element-plus 式布局。

## Approach

重建 VitePress 文档站，配置双语 locales；为每个核心组件写一份独立文档页（含示例代码块 + API 表格）；接入组件库样式与 `.aero-theme-*` 明暗主题。示例代码内嵌 markdown，不拆分独立 demo 文件。

## Scope

- **In**: VitePress 配置（双语 locales）、首页与导航、每个核心组件的独立文档（示例代码块 + API 说明）、组件库样式接入。
- **Out**: 独立 demo `.vue` 文件、交互式 playground、更多组件的文档（后续随组件 spec 补齐）。

## Boundary Candidates

- 站点框架与导航（VitePress 配置、布局、主题）
- 组件文档内容（每组件一页）

## Out of Boundary

- 组件实现（core-components）、theme token 定义、组件库内部 i18n 内容（i18n spec）。

## Upstream / Downstream

- **Upstream**: foundation（docs 脚本 + 别名）、core-components（组件可用）。
- **Downstream**: 后续组件 spec 需同步补齐对应文档页。

## Existing Spec Touchpoints

- **Extends**: 无。
- **Adjacent**: core-components（组件导出契约）、theme（样式与明暗主题接入）。

## Constraints

- 中英双语镜像（VitePress locales，与组件库 vue-i18n 无关）；示例用 markdown 内嵌代码块；VitePress 1.x。
