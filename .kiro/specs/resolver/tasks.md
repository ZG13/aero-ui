# Implementation Plan

## Task Format Template

> **Parallel marker**：`(P)` 表示该任务与紧邻的前序任务无依赖，可并发执行。本规范任务集中在同一 `src/resolver.ts` 文件内、强耦合，故不标注 `(P)`；跨边界依赖用 `_Depends:` 显式声明。

- [ ] 1. 建立 resolver 骨架与类型契约
- [ ] 1.1 建立 `packages/resolver/` 目录骨架
  - 创建 `index.ts`、`src/resolver.ts`、`types.ts` 与 `__tests__/resolver.test.ts` 空骨架
  - 完成后目录结构与 File Structure Plan 一致，且可被 vue-tsc 解析
  - _Requirements: 3.1, 5.3_
- [ ] 1.2 定义 ResolverOptions 类型契约
  - 在 `types.ts` 定义 `importStyle?: boolean`，并用 JSDoc `@default` 注明默认 `true`
  - 完成后 `types.ts` 无 `any` 并导出 `ResolverOptions`
  - _Requirements: 2.3, 5.3_

- [ ] 2. 实现 AeroResolver 解析逻辑
- [ ] 2.1 实现 Aero 前缀识别与 kebab-case 映射
  - 在 `src/resolver.ts` 实现「组件名 → 文件夹名」转换：`Aero` 前缀剥离 + PascalCase→kebab-case，非 `Aero` 前缀返回空结果
  - 完成后 `AeroButton` → `button`、`AeroDatePicker` → `date-picker`，`RouterView` / `Aerospace` 返回空
  - _Requirements: 1.1, 1.2, 1.3_
- [ ] 2.2 实现样式 side effect 路径生成
  - 按 `importStyle`（默认 `true`）生成 `aero-ui/components/{x}/style/index.css` 的 side effect；关闭时不生成
  - 该 `.css` 由 foundation 构建管线产出（`./components/*/style/*` exports + `cssCodeSplit`），resolver 只生成 side effect 路径字符串、不产出 CSS
  - 完成后组件路径与样式路径一一对应，`importStyle: false` 时不附带 side effect
  - _Requirements: 2.1, 2.2, 2.3_
- [ ] 2.3 实现 AeroResolver 工厂并输出 ComponentResolver
  - 组装 `{ type: 'component', resolve }` 的 resolver，作为 `ComponentResolver[]` 返回，`from` 指向 `aero-ui/components/{x}`
  - 完成后 `AeroResolver()` 返回值符合 unplugin-vue-components 的 `resolvers` 契约，`from` 与 `./components/*` 对齐
  - _Requirements: 1.4, 4.1, 4.3_

- [ ] 3. 导出与子路径对齐
- [ ] 3.1 在 index.ts 导出 AeroResolver 并对齐 ./resolver
  - 在 `index.ts` 导出 `AeroResolver` 并再导出 `ResolverOptions`
  - 完成后 `import { AeroResolver } from 'aero-ui/resolver'` 可解析，对应 `dist/types/resolver/index.d.ts` / `dist/es/resolver/index.mjs` / `dist/lib/resolver/index.cjs`
  - _Requirements: 3.1, 3.2_

- [ ] 4. 单元测试
- [ ] 4.1 编写 resolver 单元测试
  - 覆盖 Aero 前缀映射、kebab-case、样式 side effect、`importStyle: false`、未知名称跳过与返回形态
  - 完成后 `pnpm test` 中 resolver 相关用例通过
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 4.1, 5.4_

- [ ] 5. 验证与门禁
- [ ] 5.1 全量质量门禁与契约校验
  - 执行 `pnpm typecheck`、`pnpm lint`、`pnpm format`、`pnpm test`、`pnpm build`，全部以退出码 0 通过
  - 完成后构建产出含 `resolver` 子路径产物与类型声明；校验仅含 resolver、未 import 组件/样式源码、类型无 `any`、产物不含 `unplugin-vue-components` 运行时代码
  - _Requirements: 4.2, 4.3, 5.1, 5.2, 5.3_
