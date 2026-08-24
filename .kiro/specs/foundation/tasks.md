# Implementation Plan

> 说明：foundation 为「重建骨架」类任务，属 Foundation/Core 阶段，绝大部分配置为相互独立的文件，故部分任务标 `(P)` 可并行。任务顺序本身即表达依赖（后续任务依赖其前序任务）。

- [x] 1. 项目身份与包清单
- [x] 1.1 创建 `package.json`（包名 `aero-ui`、engines、scripts、依赖清单、files/sideEffects、exports 映射）
  - 设置 `name: "aero-ui"`、`type: "module"`、`engines.node >=18` 与 `engines.pnpm >=8`，并在 `packageManager` 声明 pnpm 版本。
  - 声明完整 `scripts`：`build`、`typecheck`、`test`、`test:watch`、`lint`、`lint:fix`、`format`、`docs:dev`、`docs:build`、`docs:preview`。
  - 按设计配置 `exports` 根入口 `.` 与子路径 `./components/*`、`./components/*/style/*`、`./resolver`、`./locale`、`./locale/lang/*`、`./hooks`、`./theme/*`、`./package.json` 的 types/import/require 分支（`./theme/*` 与 `./package.json` 为直通，`./components/*/style/*` 映射到编译后 CSS）。
  - 声明 foundation 独家拥有 `package.json` 的 exports 契约；下游 spec（i18n / core-components / resolver）不得自行改写 exports，仅消费已声明子路径。
  - 声明 `files: ["dist"]` 与 `sideEffects: ["**/*.css", "**/*.scss"]`；`vue` 为 peerDependency，`@vueuse/core`/`vue-i18n` 为运行时依赖，构建/工具链依赖齐全。
  - 完成态：`package.json` 字段齐全且 `name` 为 `aero-ui`，在干净环境下 `pnpm install` 可成功解析全部依赖。
  - _Requirements: 1.1, 2.1, 2.5, 3.1, 5.3_

- [x] 1.2 创建 `pnpm-workspace.yaml` 与 `.gitignore`
  - `pnpm-workspace.yaml` 声明 `packages` 与 `docs` 两个工作区。
  - `.gitignore` 忽略 `node_modules`、`dist`、`coverage` 等构建/依赖产物。
  - 完成态：两个文件位于仓库根，`pnpm install` 能识别工作区并正确安装依赖。
  - _Requirements: 5.3_

- [x] 2. 构建与解析契约
- [x] 2.1 创建 `vite.config.ts`（Vite library mode + `vite-plugin-dts` + external + vitest 内联配置）
  - 配置 `build.lib.entry` 为 `packages/index.ts`，`formats: ['es', 'cjs']`。
  - 配置 `preserveModules: true` 与 `preserveModulesRoot: 'packages'`，输出 `dist/es`（`.mjs`）与 `dist/lib`（`.cjs`）。
  - 配置 `cssCodeSplit: true`，使逐组件 SCSS（`packages/components/*/style/index.scss`）编译为独立 CSS，输出 `dist/**/components/*/style/index.css`，供 resolver 按需引入。
  - 配置 `rollupOptions.external: ['vue', '@vueuse/core', 'vue-i18n']`，确保运行时依赖不进产物。
  - 配置 `vite-plugin-dts`：`entryRoot: 'packages'`、`outDir: 'dist/types'`，排除 `__tests__`。
  - 内联 vitest 配置：`globals: true`、`environment: 'jsdom'`、v8 coverage 覆盖 `packages/components/**`。
  - 完成态：执行 `pnpm build` 后产出 `dist/es`、`dist/lib`、`dist/types` 三个目录。
  - _Requirements: 2.2, 2.3, 2.4, 4.4_

- [x] 2.2 (P) 创建 `tsconfig.json`（strict + `aero-ui` 路径别名）
  - 配置 `strict: true`、`target: ES2020`、`moduleResolution: Bundler`、`lib: [ES2020, DOM, DOM.Iterable]`。
  - 配置 `paths`：`aero-ui` → `packages/index.ts`、`aero-ui/*` → `packages/*`，使源码 import 镜像发布 specifier。
  - `include` 覆盖 `packages/**/*.ts`、`packages/**/*.vue`，`exclude` 排除 `node_modules` 与 `dist`。
  - 完成态：`pnpm typecheck` 以退出码 0 通过，且 `import ... from 'aero-ui'` 形式的源码导入可被解析。
  - _Requirements: 3.2, 3.3, 4.1_
  - _Boundary: 路径别名与类型配置_

- [x] 2.3 (P) 创建空入口 `packages/index.ts`
  - 创建根 barrel 入口，仅含占位导出（如 `export {}`）与下游扩展点注释；不填充任何 re-export 内容（组件 barrel、theme index、locale index、`AeroUI` 默认导出 install 归 core-components spec 拥有，避免两个 spec 争用该文件）。
  - 不引入任何组件、主题或国际化实现代码。
  - 完成态：文件存在且被 `vite.config.ts` 构建入口与 `tsconfig.json` 别名正确引用，构建不报入口缺失。
  - _Requirements: 3.4, 1.1_
  - _Boundary: 根入口_

- [x] 3. 工具链配置
- [x] 3.1 (P) 创建 `.eslintrc.cjs`
  - 配置 `vue-eslint-parser` + `@typescript-eslint/parser`，extends `eslint:recommended`、`plugin:@typescript-eslint/recommended`、`plugin:vue/vue3-recommended`。
  - 覆盖 `.vue` 与 `.ts` 源文件，`ignorePatterns` 忽略 `dist`、`node_modules` 与 `*.cjs`。
  - 完成态：`pnpm lint` 能对 `packages` 下的 `.ts`/`.vue` 生效，无 error 级违规。
  - _Requirements: 4.2_
  - _Boundary: ESLint 配置_

- [x] 3.2 (P) 创建 `.prettierrc.json`
  - 定义 `semi`、`singleQuote`、`printWidth: 100`、`trailingComma`、`arrowParens` 等格式化规则。
  - 格式化目标为 `packages/**/*.{ts,vue,scss}`。
  - 完成态：`pnpm format` 运行无异常，且格式化结果符合既定规则。
  - _Requirements: 4.3_
  - _Boundary: Prettier 配置_

- [x] 4. 集成与冒烟验证
- [x] 4.1 端到端跑通全量脚本门禁
  - 执行 `pnpm install && pnpm build`，断言 `dist/es/index.mjs`、`dist/lib/index.cjs`、`dist/types/index.d.ts` 均存在。
  - 断言 `dist` 产物中不包含 `vue` 运行时源码（external 生效）。
  - 依次执行 `pnpm typecheck`、`pnpm lint`、`pnpm format`、`pnpm test`，均以退出码 0 通过。
  - 用示例导入验证源码 import 与发布 specifier 的行为一致（对应别名与 exports 契约）。
  - 完成态：上述命令按顺序全部通过，构建产物与门禁均满足验收标准。
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.3, 4.1, 4.2, 4.3, 4.4, 5.4_

- [x] 4.2 验证命名与边界契约
  - 确认包名为 `aero-ui`、组件导出前缀为 `Aero`、CSS 变量前缀为 `--aero-*`，且骨架文件无冲突命名。
  - 确认工作树中不含任何组件实现、`base/` 迁移、i18n 字典或 resolver 源码（越界即失败）。
  - 确认 Node >=18、pnpm >=8 的运行约束已在 `engines` 中声明。
  - 完成态：命名/边界审查清单全部通过，无越界文件或命名冲突。
  - _Requirements: 1.2, 1.3, 5.1, 5.2, 5.3_

## Implementation Notes

- foundation 声明 `vitepress`（docs 脚本运行时）与 `unplugin-vue-components`（resolver 预留）为 devDependency；design「Allowed Dependencies」未显式列出二者。后续 docs-site / resolver spec 直接使用，勿重复引入。
- `docs/` 目录由 docs-site spec 创建，foundation 不创建（git 不追踪空目录，且遵循 design「foundation 不提前建域目录」原则）。
- `vite.config.ts` 用 `fileURLToPath(new URL('./packages/index.ts', import.meta.url))` 而非 `__dirname`（`type: module` 下 `__dirname` 不可用）。
- vitest 需 `passWithNoTests: true` 以通过空测试集（需求 4.4 要求退出码 0）。
- `build.lib.formats` 会触发「will be ignored because rollupOptions.output is array」良性警告，产物正确（output 数组内各项已各自声明 format/dir/entryFileNames）。
