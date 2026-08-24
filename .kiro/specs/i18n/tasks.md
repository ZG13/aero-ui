# Implementation Plan

> 说明：i18n 为「重建 locale 机制」类任务。语言包独立文件可并行，故部分任务标 `(P)`；任务顺序本身即表达依赖（后续任务依赖其前序任务）。

- [ ] 1. 语言包与类型基础
- [ ] 1.1 创建 `packages/locale/types.ts`（`Locale` 类型 + `LanguagePack` 契约）
  - 定义 `Locale = 'zh-cn' | 'en'` 联合类型，作为全库受支持语言的唯一收敛点。
  - 定义 `LanguagePack` 接口：`name: string` + 开放命名空间索引（预留 core-components 补充组件文案）。
  - 完成态：`pnpm typecheck` 通过，`Locale` / `LanguagePack` 可被后续模块正常引用。
  - _Requirements: 1.1, 1.3_

- [ ] 1.2 (P) 创建 `packages/locale/lang/zh-cn.ts`
  - 默认导出一个满足 `LanguagePack` 的中文语言包，仅含 `name: '中文'` 骨架占位，不写任何具体组件文案。
  - 完成态：`import zhCn from 'aero-ui/locale/lang/zh-cn'` 可解析，且 `zhCn.name === '中文'`。
  - _Requirements: 1.2, 4.1_
  - _Boundary: 语言包 zh-cn_

- [ ] 1.3 (P) 创建 `packages/locale/lang/en.ts`
  - 默认导出一个满足 `LanguagePack` 的英文语言包，仅含 `name: 'English'` 骨架占位，不写任何具体组件文案。
  - 完成态：`import en from 'aero-ui/locale/lang/en'` 可解析，且 `en.name === 'English'`。
  - _Requirements: 1.2, 4.1_
  - _Boundary: 语言包 en_

- [ ] 2. locale 注册入口
- [ ] 2.1 创建 `packages/locale/index.ts`（i18n 单例 + 默认语言 + 公开导出）
  - 用 `createI18n({ legacy: false, locale: 'zh-cn', fallbackLocale: 'en', messages: { 'zh-cn': zhCn, en } })` 创建全局 i18n 实例。
  - 导出 `defaultLocale`（值为 `'zh-cn'`）、`i18n` 实例、语言包（`zhCn` / `en`）与类型（`Locale` / `LanguagePack`）。
  - 完成态：模块加载即完成全局 composer 注册，`aero-ui/locale` 可解析且默认语言为 `zh-cn`。
  - _Requirements: 2.1, 2.2, 2.4, 3.3_

- [ ] 3. useLocale 切换入口
- [ ] 3.1 创建 `packages/hooks/useLocale.ts`（`t` / `locale` / `setLocale`）
  - 基于 `useI18n({ useScope: 'global' })` 实现，并从 `aero-ui/locale` 导入以确保 i18n 单例副作用先于 `useI18n` 执行。
  - 返回 `{ t, locale, setLocale }`：`locale` 为响应式 `WritableComputedRef<Locale>`，`setLocale(lang)` 改写 `locale.value`。
  - 完成态：`useLocale()` 返回三元素，默认 `t('name') === '中文'`，执行 `setLocale('en')` 后 `t('name') === 'English'`。
  - _Requirements: 3.1, 3.2_

- [ ] 3.2 创建 `packages/hooks/index.ts`（hooks barrel，re-export useLocale）
  - hooks 域当前仅 `useLocale` 一个 composable（theme 为纯 CSS、无 `useTheme`），由本 spec 提供 barrel 内容：`export { useLocale } from './useLocale'`（必要时一并 `export type`）。
  - 本 spec 只提供 `index.ts` 内容，`./hooks` 的 exports 映射归 foundation，不修改 `package.json`。
  - 完成态：`import { useLocale } from 'aero-ui/hooks'` 可解析，与 foundation 的 `./hooks` barrel 映射一致。
  - _Requirements: 3.1_
  - _Boundary: hooks barrel 内容（`./hooks` exports 映射归 foundation）_
  - _Depends: 3.1_

- [ ] 4. 集成与验证
- [ ] 4.1 验证 `./locale` 与 `./hooks` exports 映射由 foundation 暴露
  - 确认 `package.json` 的 `exports` 已包含 `./locale`、`./locale/lang/*`、`./hooks` 子路径（由 foundation 提供，本 spec 只消费、不修改）。
  - 完成态：`pnpm build` 后 `import ... from 'aero-ui/locale'` / `'aero-ui/locale/lang/zh-cn'` / `'aero-ui/hooks'` 均可按 foundation 的 exports 映射解析。
  - _Requirements: 1.2, 2.4_
  - _Boundary: 验证 foundation exports（不修改 package.json）_
  - _Depends: 2.1, 3.2_

- [ ] 4.2 编写 useLocale 与语言包的单元测试
  - 在 `packages/hooks/__tests__/` 与 `packages/locale/__tests__/` 编写 colocated 单测。
  - 覆盖：默认 `t('name') === '中文'`、`setLocale('en')` 后 `t('name') === 'English'`、缺失 key 不抛错（返回 key 或回退值）、语言包 `name` 字段存在。
  - 完成态：`pnpm test` 通过，上述断言全部通过。
  - _Requirements: 1.2, 1.3, 3.1, 3.2, 3.3_

- [ ] 4.3 构建、external 与边界验证
  - 执行 `pnpm build`，断言 `dist` 产物中不包含 `vue-i18n` 运行时源码（external 生效）。
  - 执行 `pnpm typecheck`，断言类型检查通过。
  - 边界审查：工作树中不含任何具体组件文案、无运行时语言切换 UI、无组件/主题/resolver 源码（越界即失败）。
  - 完成态：`pnpm build` 与 `pnpm typecheck` 均通过，边界审查清单全部通过。
  - _Requirements: 2.2, 2.3, 4.1, 4.2, 4.3_
