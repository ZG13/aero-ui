# Research & Design Decisions

## Summary
- **Feature**: docs-site
- **Discovery Scope**: Extension（复用上一版 ep-craft 的 VitePress 双语文档站方案，迁移命名与对齐既有组件契约）
- **Key Findings**:
  - 上一版 ep-craft 已有 VitePress 双语文档站，采用中文 + 英文镜像目录；本 spec 迁移为 VitePress 1.x locales 结构（`docs/zh-CN/` 与 `docs/en-US/`），与组件库 vue-i18n 完全解耦。
  - 组件库在 dev 阶段通过 `aero-ui` / `aero-ui/*` 别名可直接从源码消费，文档站无需先构建 `dist`，即可内嵌渲染 `AeroButton` / `AeroInput` / `AeroIcon`。
  - VitePress 默认外观切换使用 `.dark` 类，与 steering 约束「明暗切换只用 `.aero-theme-light` / `.aero-theme-dark`、禁用 `.dark`」冲突，需在主题扩展中禁用默认外观并改用 `.aero-theme-*` 根类切换。

## Research Log

### 双语文档站结构（zh-CN / en-US locales）
- **Context**: brief 明确要求中英双语镜像目录为 `docs/zh-CN/` 与 `docs/en-US/`，与 steering `structure.md` 中旧描述（`docs/` + `docs/en/`）不一致，需确定权威取值。
- **Sources Consulted**: `.kiro/specs/docs-site/brief.md`、`.kiro/specs/core-components/design.md`、VitePress 1.x locales 官方约定。
- **Findings**: brief 与任务指令均以 `docs/zh-CN/` 与 `docs/en-US/` 为准，且明确「用 VitePress locales 实现，与组件库 vue-i18n 无关」；VitePress locales 通过 `config.mts` 的 `locales` 配置将语言根目录映射到不同语言内容目录。
- **Implications**: 采用 VitePress `locales`（`root` + 两种语言）结构；`docs/zh-CN/` 为中文内容根，`docs/en-US/` 为英文内容根，默认语言设为 `zh-CN`。站点自身文案（首页、导航、主题切换按钮）也随 locale 切换。

### 组件库接入方式（源码别名 vs 构建产物）
- **Context**: 文档站需内嵌渲染组件，需确定从源码还是构建产物消费。
- **Sources Consulted**: `.kiro/specs/foundation/design.md`（`aero-ui` / `aero-ui/*` 别名）、`.kiro/specs/core-components/design.md`（组件导出与 `style/index.scss` 契约）。
- **Findings**: foundation 已建立 `aero-ui` → `packages/index.ts`、`aero-ui/*` → `packages/*` 别名；core-components 各组件 `index.ts` 导出带 `install` 的组件，样式以 `style/index.scss` 单独承载、未随 `index.ts` 自动引入。
- **Implications**: 文档站主题扩展通过 `aero-ui` 别名导入组件源码并全局注册；样式需显式引入 theme 入口（`aero-ui/theme/index.scss`）与各组件 `style/index.scss`。VitePress 的 Vite 管道已支持 `.vue` / `.scss`，无需额外构建组件库。风险点：需在 `.vitepress/config.mts` 的 `vite.resolve.alias` 中让 VitePress 解析 `aero-ui` 别名（VitePress 默认不读取根 `tsconfig.json` 的 paths）。

### 明暗主题切换（`.aero-theme-*` vs VitePress 默认 `.dark`）
- **Context**: steering `tech.md` / `theme` 契约要求明暗切换只用 `.aero-theme-light` / `.aero-theme-dark`，禁用 `.dark`。
- **Sources Consulted**: `.kiro/steering/tech.md`、`.kiro/specs/theme/design.md`、VitePress 默认主题 appearance 机制。
- **Findings**: VitePress 默认主题通过 `appearance` 配置与 `.dark` 类切换明暗；`theme` 已输出 `.aero-theme-light`（`:root` 默认）与 `.aero-theme-dark`。两者类名机制不同，不能直接混用。
- **Implications**: 在 `.vitepress/config.mts` 关闭默认 appearance（`appearance: false`），在主题扩展中实现自定义明暗切换器，于根 `<html>` 元素上切换 `.aero-theme-light` / `.aero-theme-dark`，驱动组件与使用 `--aero-*` 的站点表面；站点不使用 `.dark` 类。站点自身 chrome（VitePress 侧栏/顶栏）保持 VitePress light 外观，主题切换作用域为组件与 `--aero-*` 样式表面（见 design 边界说明）。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| VitePress locales（选定） | 单一 `.vitepress/config.mts` 声明 locales，中英内容分目录镜像 | 官方双语方案、URL 清晰、与 vue-i18n 解耦 | 需维护两套 markdown 内容 | 与 brief 一致 |
| 独立两套站点 | 中英各一个 VitePress 实例 | 完全隔离 | 配置重复、导航主题难统一 | 冗余，否决 |
| 引入 vue-i18n 做站点文案 | 复用组件库 i18n | 与组件一致 | brief 明确禁止（与组件库 vue-i18n 无关） | 越界，否决 |

## Design Decisions

### Decision: 文档站消费组件源码而非构建产物
- **Context**: 文档站需渲染组件；dev 阶段希望零构建依赖。
- **Alternatives Considered**:
  1. 从 `dist` 产物导入（需先 `pnpm build`）。
  2. 通过 `aero-ui` 源码别名导入（dev 即时）。
- **Selected Approach**: 通过 `aero-ui` / `aero-ui/*` 别名从源码导入，并在 `.vitepress/config.mts` 的 `vite.resolve.alias` 中显式映射别名。
- **Rationale**: foundation 已建立别名契约，dev 即时、无需先构建；与「源码导入镜像发布 specifier」的 steering 约定一致。
- **Trade-offs**: 需在 VitePress 侧额外声明 alias；SCSS 由 VitePress 的 Vite 管道（依赖 `sass`）编译。
- **Follow-up**: 实施时验证 `.vue` / `.scss` 在 VitePress 中可正常编译。

### Decision: 自定义 `.aero-theme-*` 切换器，禁用 VitePress 默认 appearance
- **Context**: steering 禁止 `.dark`，要求 `.aero-theme-*` 切换。
- **Alternatives Considered**:
  1. 保留 VitePress appearance 并额外同步 `.aero-theme-*`（会同时出现 `.dark`，违反约束）。
  2. 禁用默认 appearance，自定义切换器切 `.aero-theme-*`。
- **Selected Approach**: 方案 2。
- **Rationale**: 严格遵守「禁用 `.dark`」；`.aero-theme-*` 驱动 `--aero-*` 语义变量，组件视觉随切换正确变化。
- **Trade-offs**: VitePress chrome 自身明暗外观不随 `.aero-theme-*` 自动变化（其样式依赖 `--vp-*` / `.dark`）；本 spec 范围内仅保证组件与 `--aero-*` 表面的明暗切换。
- **Follow-up**: 实施时确认默认 light（`:root` 挂 light），切换器初始状态与 `.aero-theme-light` 一致。

## Risks & Mitigations
- VitePress 无法解析 `aero-ui` 别名导致组件导入失败 —— 在 `config.mts` 显式配置 `vite.resolve.alias`，并映射到绝对路径。
- 组件样式未引入导致示例无样式 —— 主题扩展显式引入 theme 入口与三个组件的 `style/index.scss`。
- 中英内容漂移（两份 markdown 不一致）—— 组件文档以同一 API 契约为源，实现时对照组件 `types.ts` 书写，减少漂移。
- 越界实现 playground / 其它组件文档 —— 以需求 6 为边界，验证任务做范围扫描。

## References
- `.kiro/specs/docs-site/brief.md` — 特性背景、方案、范围与约束。
- `.kiro/specs/core-components/design.md` — 组件导出契约、props/emits 类型、样式契约。
- `.kiro/specs/theme/design.md` — `.aero-theme-*` 明暗主题与 `--aero-*` 语义变量契约。
- `.kiro/specs/foundation/design.md` — `aero-ui` / `aero-ui/*` 别名与 docs 脚本契约。
- VitePress 1.x 官方文档 — locales 与 appearance 配置约定。
