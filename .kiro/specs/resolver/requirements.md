# Requirements Document

## Introduction

本规范（resolver）的目标是重建 `aero-ui` 的按需导入能力：实现 `AeroResolver`（`unplugin-vue-components` 的 resolver），使消费者在模板中直接书写 `<AeroButton />` 等 `AeroXxx` 组件而无需手动注册，由 resolver 按组件导出契约自动将其映射到 `aero-ui/components/x` 子路径，并附带该组件的样式 side effect 实现按需引入样式。本规范同时提供 `aero-ui/resolver` 子路径导出，与 foundation 的 exports 映射（`./components/*`、`./resolver`）对齐。本规范只实现 resolver，不实现任何新组件或组件样式内容。

## Boundary Context (Optional)

- **In scope**：`AeroResolver` 实现（名称 → 路径 → 样式解析）、`aero-ui/resolver` 子路径导出、与 `unplugin-vue-components` 的对接说明、resolver 单元测试。
- **Out of scope**：任何新组件与组件样式内容、主题 token、i18n、AI 文档与文档站。
- **Adjacent expectations**：`core-components` 已确立组件导出契约（`packages/components/*/index.ts` 导出带 `install` 的 `AeroXxx`，文件夹为小写 kebab-case）；`foundation` 已提供 `./components/*`、`./components/*/style/*` 与 `./resolver` 的 exports 子路径，并由其构建管线（Vite library mode `cssCodeSplit: true`）将 `packages/components/*/style/index.scss` 编译为 `dist/**/components/*/style/index.css`；本 spec 仅消费这些契约，不反向修改组件或构建管线。

## Requirements

### Requirement 1: 名称解析（Aero 前缀 → 组件路径）
**Objective:** As a 消费者，I want 在模板中书写 `<AeroXxx />` 时由 resolver 自动映射到对应组件子路径，so that 无需手动注册即可按需导入组件。

#### Acceptance Criteria
1.1 The AeroResolver shall 将 `<AeroXxx />` 形式的组件名映射到对应的组件子路径 `aero-ui/components/{x}`。

1.2 The AeroResolver shall 将 PascalCase 组件名转换为 kebab-case 文件夹名（如 `AeroButton` → `button`、`AeroDatePicker` → `date-picker`）。

1.3 If 组件名不匹配 `Aero` 前缀（如 `RouterView`、`ElButton`、`Aerospace`），the AeroResolver shall 返回空结果并跳过，交由其它 resolver 或插件默认行为处理。

1.4 The AeroResolver 返回的 `from` 字段 shall 指向组件 `index.ts` 的发布 specifier，与 `./components/*` exports 契约一致。

### Requirement 2: 按需引入样式
**Objective:** As a 消费者，I want resolver 在解析组件的同时按需附带该组件样式，so that 只加载用到的组件样式而非全量样式。

#### Acceptance Criteria
2.1 The AeroResolver shall 在解析组件时附带该组件的样式 side effect（按需引入对应样式，而非全量样式）。

2.2 The 样式 side effect 路径 shall 与组件路径一一对应（`aero-ui/components/{x}/style/index.css`），随组件解析自动生成。

2.3 Where `importStyle` 选项为 false，the AeroResolver shall 不附带样式 side effect（仅导入组件）。

### Requirement 3: 子路径导出
**Objective:** As a 消费者，I want 通过 `aero-ui/resolver` 子路径导入 resolver，so that 导入与发布 specifier 行为一致。

#### Acceptance Criteria
3.1 The 组件库 shall 通过 `packages/resolver/index.ts` 导出 `AeroResolver`，使 `import { AeroResolver } from 'aero-ui/resolver'` 可解析。

3.2 The resolver 子路径 shall 对齐 exports 映射 `./resolver`（`dist/types/resolver/index.d.ts` / `dist/es/resolver/index.mjs` / `dist/lib/resolver/index.cjs`）。

### Requirement 4: 与 unplugin-vue-components 对接
**Objective:** As a 消费者，I want resolver 无缝接入 unplugin-vue-components，so that 构建期自动生成组件 import 语句。

#### Acceptance Criteria
4.1 The AeroResolver shall 遵循 unplugin-vue-components 的 resolver 接口，可被 `Components({ resolvers: [AeroResolver()] })` 直接使用。

4.2 When 消费者在模板中书写 `<AeroButton />`，the unplugin-vue-components 插件 shall 借助 AeroResolver 自动生成组件 import 语句，无需消费者手动注册。

4.3 The resolver 实现 shall 仅以类型方式依赖 unplugin-vue-components（不引入运行时依赖），确保按需导入的树摇生效。

### Requirement 5: 边界与约束
**Objective:** As a 组件库维护者，I want 明确 resolver 的范围与依赖边界，so that resolver 不与组件实现耦合、不越界实现新组件。

#### Acceptance Criteria
5.1 The 组件库 shall 在 resolver 阶段不实现任何新组件，仅实现 resolver。

5.2 The resolver 实现 shall 只消费组件导出契约与 exports 映射，不反向依赖组件内部实现或样式内容。

5.3 The resolver 类型定义 shall 遵循 TypeScript strict 模式，禁止使用 `any`。

5.4 The resolver 应提供单元测试，覆盖名称映射、样式路径解析与未知名称跳过行为。
