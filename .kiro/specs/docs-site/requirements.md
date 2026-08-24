# Requirements Document

## Introduction

本规范（docs-site）的目标是重建 `aero-ui` 组件库的面向使用者的 VitePress 文档站：以中英双语镜像（`docs/zh-CN/` 与 `docs/en-US/`，通过 VitePress locales 实现，与组件库的 vue-i18n 无关）展示三个核心组件（Button、Input、Icon）的用法示例与 API 说明。站点包含首页、顶部导航与左侧侧边栏，并接入组件库语义样式与 `.aero-theme-*` 明暗主题切换。示例代码以 markdown 内嵌代码块展示，不拆分独立 demo 文件；不实现交互式 playground，也不为三个核心组件之外的组件编写文档。

## Boundary Context (Optional)

- **In scope**：VitePress 1.x 站点配置与双语 locales；首页与导航（nav / sidebar）；Button、Input、Icon 三个组件各一份独立文档（用法示例代码块 + API 表格）；组件库样式（`--aero-*` 语义变量）与 `.aero-theme-light` / `.aero-theme-dark` 明暗主题切换接入；`docs:dev` / `docs:build` / `docs:preview` 脚本可用。
- **Out of scope**：独立 demo `.vue` 文件；交互式 playground；三个核心组件之外的组件文档；组件实现（属 core-components）；主题 token 定义（属 theme）；组件库内部 i18n 机制（属 i18n）。
- **Adjacent expectations**：`core-components` 已提供 `AeroButton` / `AeroInput` / `AeroIcon` 的导出契约（`aero-ui/components/*` 子路径导出带 `install` 的组件并再导出 `types.ts` 类型）；`theme` 已提供语义 `--aero-*` 变量与 `.aero-theme-light` / `.aero-theme-dark` 明暗主题；`foundation` 已在 `package.json` 声明 `docs:dev` / `docs:build` / `docs:preview` 脚本并建立 `aero-ui` / `aero-ui/*` 路径别名。

## Requirements

### Requirement 1: 文档站框架与双语配置
**Objective:** As a 组件库使用者，I want 一个可访问的中英双语组件文档站，so that 中文与英文开发者都能查看组件用法与 API 说明。

#### Acceptance Criteria
1.1 The 文档站 shall 基于 VitePress 1.x 构建，作为组件文档的统一访问入口。

1.2 The 文档站 shall 通过 VitePress locales 提供中英双语镜像，中文内容位于 `docs/zh-CN/`，英文内容位于 `docs/en-US/`。

1.3 The 文档站 shall 提供语言切换入口，使访问者可在中文与英文站点之间切换。

1.4 The 文档站 shall 设置默认语言，使访问者未指定语言时看到默认语言内容。

### Requirement 2: 首页与站点导航
**Objective:** As a 组件库使用者，I want 一个含首页、顶部导航与左侧侧边栏的站点布局，so that 能快速定位到所需的组件文档。

#### Acceptance Criteria
2.1 The 文档站 shall 提供首页，展示组件库名称、简介与快速入口。

2.2 The 文档站 shall 提供左侧导航（sidebar），列出文档分组与各组件文档页。

2.3 The 文档站 shall 在顶部导航（nav）提供首页与组件文档的入口。

2.4 The 文档站 shall 在中文与英文站点分别提供对应语言的首页与导航文案。

### Requirement 3: 组件文档页
**Objective:** As a 组件库使用者，I want 每个核心组件各有一份独立的文档页，so that 通过示例与 API 说明快速上手使用组件。

#### Acceptance Criteria
3.1 The 文档站 shall 为 Button、Input、Icon 三个核心组件各提供一份独立文档页（`button.md`、`input.md`、`icon.md`）。

3.2 The 每个组件文档页 shall 展示组件的用法示例，示例代码以 markdown 内嵌代码块呈现。

3.3 The 每个组件文档页 shall 提供 API 说明（props、事件与默认值），并与组件 `types.ts` 的类型契约保持一致。

3.4 The 每个组件文档页 shall 在中文与英文站点各有一份对应语言的内容。

3.5 The 组件文档页 shall 展示实际渲染的组件效果（通过 VitePress 在 markdown 中内嵌 Vue 组件）。

### Requirement 4: 组件样式与明暗主题接入
**Objective:** As a 组件库使用者，I want 文档站内的示例组件呈现正确的主题视觉并支持明暗切换，so that 预览效果与真实使用一致。

#### Acceptance Criteria
4.1 The 文档站 shall 引入组件库样式（语义 `--aero-*` 变量），使示例组件呈现正确的视觉。

4.2 The 文档站 shall 提供明暗主题切换入口。

4.3 When 访问者切换明暗主题，the 文档站 shall 通过 `.aero-theme-light` / `.aero-theme-dark` 根类切换组件与站点主题。

4.4 The 文档站 shall 默认使用 light 主题。

### Requirement 5: 文档脚本与构建
**Objective:** As a 组件库维护者，I want 文档站可本地开发、构建与预览，so that 能开发并发布静态文档站点。

#### Acceptance Criteria
5.1 The 文档站 shall 提供 `docs:dev` 脚本启动本地开发服务器。

5.2 The 文档站 shall 提供 `docs:build` 脚本构建静态站点产物。

5.3 The 文档站 shall 提供 `docs:preview` 脚本预览构建产物。

5.4 When 执行 `docs:build`，the 文档站 shall 成功生成可部署的静态站点，且中文与英文页面均可用。

### Requirement 6: 范围与边界约束
**Objective:** As a 组件库维护者，I want 文档站严格限定在三个核心组件与 markdown 内嵌示例的范围，so that 不越界实现 playground 或其它组件的文档。

#### Acceptance Criteria
6.1 The 文档站 shall 仅为 Button、Input、Icon 三个核心组件编写文档，不为其它组件编写文档。

6.2 The 文档站 shall 不实现交互式 playground，示例以静态代码块与内嵌组件渲染呈现。

6.3 The 组件文档示例 shall 以 markdown 内嵌代码块展示，不拆分独立 demo `.vue` 文件。

6.4 The 文档站双语镜像 shall 仅由 VitePress locales 承担，与组件库的 vue-i18n 机制无关。
