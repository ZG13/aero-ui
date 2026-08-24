# Research & Design Decisions

## Summary
- **Feature**: foundation
- **Discovery Scope**: New Feature（greenfield 重建），但技术栈与构建方案已由 steering 与 git 历史中上一版 `ep-craft` 脚手架完全确定，因此执行 light discovery（参照式），无需外部 WebSearch。
- **Key Findings**:
  - 上一版 `ep-craft` 脚手架（git 提交 `2c2a723`）已含完整可复用的构建方案：Vite 5 library mode + `vite-plugin-dts`，`preserveModules` 双格式输出（`dist/es` 为 `.mjs`、`dist/lib` 为 `.cjs`），`preserveModulesRoot: 'packages'`，`external: ['vue', '@vueuse/core', 'vue-i18n']`。
  - `package.json` 的 `exports` 映射已明确根入口与子路径（`./components/*`、`./resolver`、`./theme/*`）的 types/import/require 三分支，只需把包名从 `ep-craft` 改为 `aero-ui`。
  - `tsconfig.json` 的 `paths` 别名需从 `ep-craft` / `ep-craft/*` 改为 `aero-ui` / `aero-ui/*`；其余 compilerOptions（strict、Bundler 解析、ES2020）保持不变。
  - `base/color.scss` 与 `base/number.scss` 是暂存的原始设计 token（SCSS 变量），归属 `theme` spec 迁移，foundation 不得触碰。

## Research Log

### 上一版脚手架构建方案
- **Context**: 仓库已被清空，需要可靠参照来重建构建管线。
- **Sources Consulted**: git 历史提交 `2c2a723`（`package.json`、`vite.config.ts`、`tsconfig.json`、`pnpm-workspace.yaml`、`.eslintrc.cjs`、`.prettierrc.json`）。
- **Findings**:
  - `vite.config.ts` 已正确配置 `build.lib.entry = packages/index.ts`、`formats: ['es','cjs']`、`rollupOptions.external`、双 output（es/cjs）与 `vite-plugin-dts`（`entryRoot: 'packages'`、`outDir: 'dist/types'`）。
  - `sideEffects` 标记了 `**/*.css` / `**/*.scss`，保证样式不被 tree-shake 掉。
  - vitest 配置内联于 `vite.config.ts` 的 `test` 字段（globals + jsdom + v8 coverage）。
- **Implications**: foundation 直接复用该方案，仅做命名迁移（`ep-craft` → `aero-ui`）与必要的脚本/依赖版本校准，无需重新设计构建架构。

### 依赖版本与运行约束
- **Context**: 确定 devDependencies / peerDependencies / engines 以落地 `pnpm install && pnpm build`。
- **Sources Consulted**: 上一版 `package.json`；steering `tech.md`。
- **Findings**: Vue 3.4、Vite 5、TypeScript ~5.4（strict）、vue-tsc、sass、eslint 8 + vue plugin、prettier 3、vitest + @vue/test-utils + jsdom、vite-plugin-dts 3.x。运行时依赖 `@vueuse/core`、`vue-i18n` 虽在 foundation 阶段无源码引用，但作为 external 与 peer/deps 声明以稳定后续 spec 的契约。
- **Implications**: 依赖清单与 engines（Node >=18、pnpm >=8）直接写入 package.json；`vue` 仅作为 peerDependency + devDependency。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Vite library mode + preserveModules | 单入口 `packages/index.ts`，Rollup 按模块结构输出 ESM/CJS，`vite-plugin-dts` 生成类型 | 产物结构镜像源码、支持 tree-shaking、双格式覆盖现代与 legacy 消费者 | 需正确配置 `preserveModulesRoot` 与 `external`，否则路径错乱 | 采纳，与 steering `tech.md` 一致 |
| 多包 workspace 发布 | 每个域独立 npm 包 | 边界清晰 | 发布/版本管理复杂，超出本组件库定位 | 拒绝，steering 明确「单包」架构 |

## Design Decisions

### Decision: 复用 `ep-craft` 构建方案并迁移命名
- **Context**: 需要一条可复现的双格式构建管线，而上一版方案已被验证可行。
- **Alternatives Considered**:
  1. 从零设计新的构建配置
  2. 复用上一版 `ep-craft` 的配置，仅迁移命名
- **Selected Approach**: 复用上一版方案，将包名/别名/前缀/ token 前缀迁移为 `aero-ui` / `Aero` / `--aero-*`。
- **Rationale**: 上一版方案与 steering `tech.md` 完全一致，避免了无意义的重新设计，降低风险。
- **Trade-offs**: 依赖少量历史配置的「惯性」，但可通过 typecheck/lint/build 三重门禁兜底。
- **Follow-up**: 实施后需跑 `pnpm build` 验证 `dist/es`、`dist/lib`、`dist/types` 三份产物齐全。

### Decision: 空入口采用「根 barrel + 域占位」而非零文件
- **Context**: 需求 3.4 要求空入口可被后续 spec 扩展而不改变构建契约。
- **Alternatives Considered**:
  1. `packages/index.ts` 完全空文件
  2. `packages/index.ts` 作为根 barrel，仅含占位导出/注释，域目录暂不创建
  3. 提前创建全部域目录占位文件
- **Selected Approach**: 选项 2 —— 根入口 `packages/index.ts` 含占位导出与扩展点注释；域目录（components/hooks/locale/theme/resolver）的占位入口由各自下游 spec 创建。
- **Rationale**: 既保证 `pnpm build` 与 dts 生成可运行，又不越界替 theme/i18n/resolver 创建属于它们的目录，守住边界（需求 5）。
- **Trade-offs**: exports 中 `./components/*` 等子路径在 foundation 阶段暂无对应源文件，构建契约已声明、实现延迟到下游 spec。
- **Follow-up**: 下游 spec 创建域目录时须与 exports 子路径保持一致。

## Risks & Mitigations
- 复用历史配置可能带入过时依赖版本 —— 通过 typecheck/lint/build/test 四重脚本门禁验证，必要时升级补丁版本。
- `preserveModules` 输出路径与 exports 映射不一致会导致消费者解析失败 —— 以「源码 import 与发布 specifier 行为一致」（需求 3.3）为验收口径，实施后用示例导入验证。
- 空入口构建可能产生空产物或 Rollup 告警 —— 根入口保留占位导出，确保有可生成的 d.ts。

## References
- steering `tech.md` — 技术栈与关键决策（双格式构建、路径别名、external）。
- steering `structure.md` — 目录模式与命名约定。
- git 提交 `2c2a723` — 上一版 `ep-craft` 脚手架完整配置。
