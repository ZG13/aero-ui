# Implementation Plan

## Task Format Template

> **Parallel marker**：`(P)` 表示该任务与紧邻的前序任务无依赖，可并发执行。跨边界依赖用 `_Depends:` 显式声明；`_Boundary:` 标注组件边界。

- [ ] 1. 搭建 VitePress 站点骨架与双语配置
- [ ] 1.1 创建 VitePress 项目结构与配置入口
  - 创建 `docs/.vitepress/config.mts`（站点标题、基础配置）与 `docs/.vitepress/theme/index.ts` 骨架（暂用默认主题）
  - 在 `config.mts` 中配置 `vite.resolve.alias`，将 `aero-ui` 映射到 `packages/index.ts`、`aero-ui/*` 映射到 `packages/*`
  - 完成后 `pnpm docs:dev` 可启动本地服务器并显示默认页面
  - _Requirements: 1.1_
- [ ] 1.2 配置中英双语 locales 与默认语言
  - 在 `config.mts` 中定义 `locales`（`zh-CN` 为默认、`en-US`），为两种语言分别设置 `lang`、`label`、`title` 与内容目录
  - 完成后访问 `/`、`/zh-CN/`、`/en-US/` 均进入对应语言站点，且语言切换可用
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 2. 配置导航与首页
- [ ] 2.1 配置顶部导航与左侧侧边栏
  - 在 `config.mts` 中为两种语言分别配置 `themeConfig.nav` 与 `themeConfig.sidebar`（含首页入口与「组件」分组下的 button / input / icon）
  - 完成后两种语言下侧边栏与顶部导航均展示对应语言文案，且各组件文档入口可点击跳转
  - _Requirements: 2.2, 2.3, 2.4_
- [ ] 2.2 创建中文首页
  - 编写 `docs/zh-CN/index.md`，含 hero 标题、组件库简介与指向组件文档的快速入口
  - 完成后中文首页展示组件库名称、简介与导航入口
  - _Requirements: 2.1, 2.4_
- [ ] 2.3 创建英文首页
  - 编写 `docs/en-US/index.md`，含英文 hero 标题、组件库简介与快速入口
  - 完成后英文首页展示英文组件库名称、简介与导航入口
  - _Requirements: 2.1, 2.4_

- [ ] 3. 编写组件文档页（三个组件可并行）
- [ ] 3.1 (P) 编写 Button 组件中英文档
  - 编写 `docs/zh-CN/components/button.md` 与 `docs/en-US/components/button.md`，含用法示例（markdown 内嵌代码块 + 内嵌 `<AeroButton>` 渲染）与 API 表格
  - API 表格覆盖 type / size / disabled / loading / icon / nativeType 与 click 事件，与 `ButtonProps` / `ButtonEmits` 契约一致
  - 完成后中英两种语言的 button 页面均展示示例代码块与 API 表格
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - _Boundary: Button 文档_
- [ ] 3.2 (P) 编写 Input 组件中英文档
  - 编写 `docs/zh-CN/components/input.md` 与 `docs/en-US/components/input.md`，含用法示例与 API 表格
  - API 表格覆盖 modelValue / placeholder / disabled / clearable / size 与 update:modelValue / input / change / focus / blur / clear 事件，与 `InputProps` / `InputEmits` 契约一致
  - 完成后中英两种语言的 input 页面均展示示例代码块与 API 表格
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - _Boundary: Input 文档_
- [ ] 3.3 (P) 编写 Icon 组件中英文档
  - 编写 `docs/zh-CN/components/icon.md` 与 `docs/en-US/components/icon.md`，含用法示例与 API 表格
  - API 表格覆盖 name / size / color，与 `IconProps` 契约一致
  - 完成后中英两种语言的 icon 页面均展示示例代码块与 API 表格
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - _Boundary: Icon 文档_

- [ ] 4. 接入组件样式与明暗主题
- [ ] 4.1 在主题扩展中注册组件并接入组件库样式
  - 在 `.vitepress/theme/index.ts` 中 `app.use` 全局注册 `AeroButton` / `AeroInput` / `AeroIcon`，并显式引入 `aero-ui/theme/index.scss` 与三个组件的 `style/index.scss`
  - 完成后 markdown 内嵌的 `<AeroButton>` / `<AeroInput>` / `<AeroIcon>` 正常渲染且样式正确
  - _Requirements: 3.5, 4.1_
- [ ] 4.2 实现明暗主题切换器
  - 创建 `.vitepress/theme/ThemeSwitch.vue` 与 `style.css`，在根 `<html>` 元素上切换 `.aero-theme-light` / `.aero-theme-dark`，默认 light；在 `config.mts` 设置 `appearance: false`
  - 将切换器经 Layout 插槽注入到每个页面顶部
  - 完成后切换明暗时组件与 `--aero-*` 表面视觉随之变化，站点未出现 `.dark` 类
  - _Requirements: 4.2, 4.3, 4.4_
  - _Depends: 4.1_

- [ ] 5. 构建验证与范围校验
- [ ] 5.1 验证 docs 脚本与构建产物
  - 确认 `docs:dev` / `docs:build` / `docs:preview` 脚本可运行；执行 `pnpm docs:build` 成功生成静态站点
  - 完成后 `docs:build` 退出码 0，产物包含 zh-CN 与 en-US 两套页面且均可访问
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
- [ ] 5.2 范围与边界校验
  - 校验工作树仅含 Button / Input / Icon 三个组件文档、无 playground、示例未拆独立 demo `.vue` 文件、双语仅由 VitePress locales 承担（不依赖 vue-i18n）、未修改组件/主题/i18n 既有文件
  - 完成后边界扫描无违规项，`docs:build` 与明暗切换冒烟通过
  - _Requirements: 6.1, 6.2, 6.3, 6.4_
