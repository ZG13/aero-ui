# Research & Design Decisions

## Summary
- **Feature**: `resolver`
- **Discovery Scope**: Extension（对既有组件导出契约的薄消费者层）
- **Key Findings**:
  - unplugin-vue-components 的 resolver 返回形态为 `{ name, from, sideEffects? }`（或 `ComponentResolveResult`），工厂函数常返回 `ComponentResolver[]`。
  - 组件导出契约已由 core-components 确立：`packages/components/{kebab}/index.ts` 导出带 `install` 的 `AeroXxx`，文件夹为小写 kebab-case。
  - foundation 的 exports 映射含 `./components/*`（→ `dist/es/components/*/index.mjs`）与 `./resolver`（→ `dist/es/resolver/index.mjs`），但不含逐组件样式子路径——样式 side effect 路径是 resolver 侧需显式声明的契约。

## Research Log

### unplugin-vue-components resolver 接口
- **Context**: 确认 resolver 的正确返回形态与依赖方式。
- **Sources Consulted**: unplugin-vue-components 官方文档与类型定义（`ComponentResolver` / `ComponentResolveResult` / `ComponentInfo`）。
- **Findings**:
  - `resolvers` 接受 `ComponentResolver[]`，每个元素可为 `{ type: 'component', resolve }` 或裸函数。
  - `resolve(name)` 返回 `{ name, from, sideEffects? }`，其中 `from` 为组件模块 specifier，`sideEffects` 为附加样式导入路径。
  - 常见生态（Element Plus / Ant Design Vue / Vant）均以工厂函数 `XxxResolver()` 返回 `ComponentResolver[]`。
- **Implications**: `AeroResolver(options?) => ComponentResolver[]`，`resolve` 返回 `{ name, from, sideEffects }`；类型仅从 `unplugin-vue-components` 引入。

### 组件导出契约（上游 core-components）
- **Context**: 确定 `from` 与样式路径的映射规则。
- **Sources Consulted**: `.kiro/specs/core-components/design.md`、`.kiro/specs/foundation/design.md`。
- **Findings**:
  - 组件文件夹为小写 kebab-case（`button` / `input` / `icon`），`index.ts` 导出 `AeroButton` / `AeroInput` / `AeroIcon`。
  - `./components/*` 解析目标为 `dist/es/components/*/index.mjs`，故 `from` 应为 `aero-ui/components/{kebab}`。
  - foundation exports 无逐组件样式子路径；组件 `style/index.scss` 为 SCSS 源码，发布侧需编译为 CSS 供 side effect 导入。
- **Implications**: `from` 取 `aero-ui/components/{kebab}`；样式 side effect 取编译后 CSS `aero-ui/components/{kebab}/style/index.css`，并作为本 spec 声明的样式契约（构建管线需在该路径发布编译后 CSS）。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 通用前缀剥离映射 | 任意 `AeroXxx` → `components/{kebab}`，不维护白名单 | 无需随组件增删而更新 resolver；确定性强 | 不存在的组件会生成指向缺失路径的 import，构建期报错 | 选中，契合「AI 友好、确定性约定」 |
| 硬编码白名单 | 维护已知组件集合，仅命中白名单才解析 | 可拦截不存在的组件 | 每新增组件都需改 resolver；引入额外耦合 | 拒绝，违背「薄消费者层」定位 |

## Design Decisions

### Decision: 通用前缀剥离 + kebab-case 映射（不维护白名单）
- **Context**: 需要将 `<AeroXxx />` 映射到组件子路径，且未来会持续新增组件。
- **Alternatives Considered**:
  1. 通用映射：剥离 `Aero` 前缀 + PascalCase→kebab-case。
  2. 硬编码白名单。
- **Selected Approach**: 通用映射，`name.startsWith('Aero')` 且第五个字符为大写时命中，`raw = name.slice(4)`，`dir = kebabCase(raw)`。
- **Rationale**: 组件导出契约是确定性的（`AeroX` ↔ `components/x`），通用映射无需随组件集增长而维护，符合 AI 友好约定。
- **Trade-offs**: 不存在的 `AeroXxx` 会生成指向缺失路径的 import（构建期失败，清晰可诊断），而非静默忽略。
- **Follow-up**: 实现时校验 kebab-case 对连续大写与数字边界的处理。

### Decision: 样式 side effect 路径为 `aero-ui/components/{x}/style/index.css`
- **Context**: foundation exports 无逐组件样式子路径，但按需样式是硬需求。
- **Alternatives Considered**:
  1. 指向全量主题入口（`aero-ui/theme/*`）—— 全量样式，违背按需。
  2. 指向组件 SCSS 源码—— 依赖消费者自建 SCSS 编译管线。
  3. 指向编译后逐组件 CSS `aero-ui/components/{x}/style/index.css`。
- **Selected Approach**: 方案 3，`sideEffects` 取编译后逐组件 CSS。
- **Rationale**: 与 `from` 路径同根、一一对应，逐组件按需；发布库应以编译产物为准。
- **Trade-offs**: 该路径依赖构建管线（foundation）在 `dist/` 发布逐组件编译后 CSS；本 spec 仅声明契约并列入 Revalidation Triggers，不实现构建。
- **Follow-up**: 实现后冒烟验证该样式路径可被解析（或确认构建产出该 CSS）。

### Decision: unplugin-vue-components 为类型级依赖（peer/optional）
- **Context**: resolver 输出为纯配置对象，无需运行时依赖该库。
- **Selected Approach**: `unplugin-vue-components` 作为类型级依赖（`devDependencies` 用于本库构建与 typecheck；因消费者必然安装该插件，可同时声明为 `peerDependencies` optional）。
- **Rationale**: 保证按需导入的树摇，避免打包进运行时依赖。
- **Trade-offs**: 发布的 `.d.ts` 会引用 `unplugin-vue-components` 类型，需消费者已安装该包（其使用 resolver 时天然满足）。

## Risks & Mitigations
- 样式 side effect 路径与构建产物不一致 —— 在 Revalidation Triggers 声明该契约，实现后做冒烟校验。
- kebab-case 边界（连续大写 / 数字 / 首字母）处理不当 —— 单测覆盖 `AeroButton` / `AeroDatePicker` 等代表用例。
- 误匹配非 Aero 组件导致错误 import —— 用 `/^Aero[A-Z]/` 正则收敛匹配范围，未知前缀跳过。

## References
- [unplugin-vue-components — resolvers](https://github.com/unplugin/unplugin-vue-components) —— resolver 接口与 `sideEffects` 语义。
- `.kiro/specs/core-components/design.md` —— 组件导出契约。
- `.kiro/specs/foundation/design.md` —— `./components/*` / `./resolver` exports 映射。
