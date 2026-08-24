# Research & Design Decisions

## Summary
- **Feature**: i18n
- **Discovery Scope**: New Feature（greenfield 重建），但技术栈与上一版方案已由 steering 与 git 历史完全确定（Element Plus 风格 `packages/locale/` + `lang/{zh-cn,en}.ts` + `vue-i18n`），因此执行 light discovery（参照式），无需外部 WebSearch。
- **Key Findings**:
  - steering `tech.md` 已将 `vue-i18n` 列为运行时依赖，且明确「runtime deps externalized：`vue`、`@vueuse/core`、`vue-i18n` 不进产物」，与需求 2.3 一致。
  - steering `structure.md` 明确目录归属：语言包在 `packages/locale/`（`lang/zh-cn.ts`、`lang/en.ts`），而 `useLocale.ts` 在 `packages/hooks/`（共享 composables）。故本 spec 同时创建 `packages/locale/` 与 `packages/hooks/useLocale.ts`。
  - 上一版（Element Plus 风格）`ep-craft` 的 `packages/locale/` 采用「全局 i18n 实例 + 语言包独立文件」模式，本设计沿用其最小核心：`createI18n` 单例 + 默认 `zh-cn` + `useI18n({ useScope: 'global' })` 的 `useLocale`。
  - foundation 的 `package.json` exports 已声明 `./components/*`、`./resolver`、`./theme/*`，但未声明 `./locale` 与 `./hooks` 子路径——发布后消费者无法解析 `aero-ui/locale` / `aero-ui/hooks`，需由本 spec 补齐 exports 映射。

## Research Log

### 上一版 locale 方案（Element Plus 风格）
- **Context**: 需要可靠参照来重建 locale 机制，仓库当前为空。
- **Sources Consulted**: git 历史提交 `2c2a723`（上一版 `ep-craft` 的 `packages/locale/`）；steering `structure.md`、`tech.md`。
- **Findings**:
  - 语言包独立文件：`lang/zh-cn.ts`、`lang/en.ts`，各自 `export default` 一个语言包对象（含 `name` 字段标识自身语言名）。
  - 注册入口 `packages/locale/index.ts`：`createI18n` 创建全局实例，`locale: 'zh-cn'` 为默认，导出语言包与默认语言。
  - `useLocale` 通过 `useI18n({ useScope: 'global' })` 获取全局 `t` 与响应式 `locale`，切换即改写 `locale.value`。
- **Implications**: 本 spec 复用该最小核心，仅做命名迁移（`ep-craft` → `aero-ui`）与 Vue 3 组合式 API 对齐（`legacy: false`），不引入 ConfigProvider 级 per-component locale 覆盖（属 core-components 后续扩展）。

### vue-i18n 版本与组合式 API
- **Context**: 确定 vue-i18n 版本与全局作用域用法，以满足需求 3（useLocale 响应式切换）。
- **Sources Consulted**: steering `tech.md`（Vue 3.4 + 组合式 API）；vue-i18n v9 组合式 API 约定。
- **Findings**: vue-i18n 9.x 支持 Vue 3 组合式 API；`createI18n({ legacy: false, locale, fallbackLocale, messages })` 会设置全局 composer；`useI18n({ useScope: 'global' })` 返回的 `t` 与 `locale` 均响应式，locale 变化时 `t` 自动重解析新语言文案，满足需求 3.2/3.3。
- **Implications**: 采用 `legacy: false` + `useScope: 'global'`；`fallbackLocale: 'en'` 与默认 `missing` 行为（返回 key 本身）覆盖需求 3.3。

### exports 子路径缺口
- **Context**: foundation 的 exports 未声明 `./locale` / `./hooks`，影响「供消费者复用」。
- **Sources Consulted**: foundation 的 `design.md`（exports 契约表）。
- **Findings**: foundation exports 仅含 `.`、`./components/*`、`./resolver`、`./theme/*`、`./package.json`，无 `./locale` / `./hooks` / `./locale/lang/*`。
- **Implications**: 本 spec 通过集成任务向 `package.json` exports 追加 `./locale`、`./locale/lang/*`、`./hooks` 子路径（types/import/require 三分支，与 foundation 契约一致）。`./hooks` 是与 `theme`（`useTheme.ts`）共享的 seam，已标注为跨 spec 集成点。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 全局 i18n 单例 + useI18n 全局作用域 | `packages/locale/index.ts` 创建 `createI18n` 单例，`useLocale` 用 `useI18n({ useScope: 'global' })` | 最小、无需 `app.use` 即可工作、`t`/`locale` 天然响应式 | 无 per-component locale 覆盖（需 ConfigProvider 时再扩展） | 采纳，与 steering 一致 |
| ConfigProvider + provide/inject 覆盖 | 组件树层级注入 locale，回退全局 | 支持局部语言覆盖（如某组件区强制 en） | 需额外 Provider 组件，超出「仅搭机制」范围 | 拒绝，推迟到 core-components |
| 手写 i18n（不用 vue-i18n） | 自建字典查找与 ref 切换 | 无外部依赖 | 重复造轮子、失去插值/复数/回退能力 | 拒绝，steering 明确采用 `vue-i18n` |

## Design Decisions

### Decision: 沿用 Element Plus 风格的最小 locale 核心
- **Context**: 需求要求基于 `vue-i18n` 提供注册与切换入口，仅搭机制。
- **Alternatives Considered**:
  1. 完整复刻 Element Plus 的 `ConfigProvider` + `useLocale` 注入体系
  2. 只做全局 i18n 单例 + `useLocale` 全局作用域
- **Selected Approach**: 选项 2 —— `packages/locale/index.ts` 创建 `createI18n` 单例（`legacy: false`、默认 `zh-cn`、`fallbackLocale: 'en'`），`packages/hooks/useLocale.ts` 用 `useI18n({ useScope: 'global' })` 暴露 `{ t, locale, setLocale }`。
- **Rationale**: 满足「仅搭机制」的最小实现，天然响应式，无需额外 Provider；`vue-i18n` 作为 external 不进产物。
- **Trade-offs**: 暂不支持 per-component locale 覆盖，core-components 若需局部覆盖需后续引入 Provider（已记为扩展点）。
- **Follow-up**: 实施后用单测验证 `setLocale('en')` 后 `t('name')` 从「中文」变为「English」。

### Decision: `useLocale` 物理位置放在 `packages/hooks/`
- **Context**: brief 将 `useLocale` 归入 locale 机制，但 steering `structure.md` 明确 `useLocale.ts` 位于 `packages/hooks/`。
- **Alternatives Considered**:
  1. `packages/locale/useLocale.ts`
  2. `packages/hooks/useLocale.ts`
- **Selected Approach**: 选项 2 —— 语言包与注册入口归 `packages/locale/`，`useLocale` composable 归 `packages/hooks/`（依赖方向 hooks → locale，单向无环）。
- **Rationale**: 遵守 steering `structure.md` 的目录契约，`useTheme`（theme spec）与 `useLocale`（本 spec）同处 `packages/hooks/`，共享同一发布子路径 `./hooks`。
- **Trade-offs**: locale 机制跨两个目录，需在 File Structure Plan 与 `_Boundary:_` 中显式区分，避免与 theme 的 `./hooks` 子路径注册重复。
- **Follow-up**: 与 theme spec 对齐 `./hooks` 子路径的 exports 声明，避免重复注册或冲突。

## Risks & Mitigations
- `useI18n({ useScope: 'global' })` 在未导入 `packages/locale/index.ts`（未执行 `createI18n`）时全局 composer 未注册 —— `useLocale` 显式从 `aero-ui/locale` 导入，确保单例副作用先执行。
- exports 子路径（`./locale`、`./hooks`）与 foundation/theme 共享 seam，autonomous 实现可能冲突 —— 以单一集成任务集中注册，并在 `_Boundary:_` 与跨 spec 评审中标注。
- 语言包仅含 `name` 字段，后续 core-components 补充文案时需扩展 `LanguagePack` 契约 —— `LanguagePack` 采用 interface 且开放命名空间索引，预留扩展。

## References
- steering `tech.md` — 技术栈（vue-i18n 为运行时依赖、external 列表）。
- steering `structure.md` — 目录模式（`packages/locale/` 语言包、`packages/hooks/` composables）。
- foundation `design.md` — exports 契约与路径别名（`aero-ui/*`）。
- git 提交 `2c2a723` — 上一版 `ep-craft` 的 `packages/locale/` 方案。
