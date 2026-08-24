# Research & Design Decisions

## Summary
- **Feature**: core-components
- **Discovery Scope**: Extension（在 foundation / theme / i18n 既有契约之上增量实现组件）
- **Key Findings**:
  - 组件文件夹采用小写 kebab-case（`button` / `input` / `icon`），对齐发布 specifier `aero-ui/components/button` 与 foundation `./components/*` 直通子路径；`.vue` 文件保持 PascalCase（`src/Button.vue`）。
  - 三组件共享同一份「一个组件一个文件夹」契约与 `<script setup lang="ts">` + `defineProps<T>()` 约定，Icon 是 Button（icon 属性）与 Input（clearable 清空图标）的公共叶子依赖。
  - 组件文案 key 采用 `components.<component>.<field>` 命名空间补充进 `zh-cn` / `en` 语言包（i18n 已明确该职责归属 core-components）。

## Research Log

### 组件目录命名（大小写）
- **Context**: `structure.md` 的目录示例用 `Button/`（PascalCase），而 Import Organization 示例写 `aero-ui/components/button`（小写），二者不一致。
- **Sources Consulted**: `.kiro/steering/structure.md`、`.kiro/specs/foundation/design.md`（exports `./components/*`）、`.kiro/specs/core-components/brief.md`（`src/Xxx.vue`）。
- **Findings**: foundation 的 `./components/*` 由 Rollup `preserveModules` 按源码目录名直通输出，目录名即发布子路径名；消费示例为小写 `button`。
- **Implications**: 组件文件夹采用小写 kebab-case（`button` / `input` / `icon`），`.vue` 文件名保持 PascalCase（`src/Button.vue`），`index.ts` 导出 PascalCase 组件对象（`AeroButton`）。

### 上一版 Button 样板
- **Context**: brief 指出上一版已实现 `EpButton`（Button.vue + types.ts + style + test），需迁移为 `Aero` 前缀与 `--aero-*` token。
- **Findings**: 可复用其「组件一个文件夹」的分层（types / style / src / test / index）与 `defineProps<T>` + `withDefaults` 的写法。
- **Implications**: Button 作为三组件的规范样板先行实现，Input 与 Icon 复用同一结构。

### 图标渲染方案（build vs adopt）
- **Context**: `AeroIcon` 需按名称渲染图标，且不得引入 steering 未声明的外部图标库。
- **Alternatives Considered**:
  1. 引入外部图标库（如 `@element-plus/icons-vue`）—— 需改动 foundation 依赖，超出本 spec 边界。
  2. 内置最小图标集（`name` → 内联 SVG 路径映射），组件自持。
- **Selected Approach**: 内置最小图标集（`loading`、`close`、`search` 等），`AeroIcon` 按 `name` 渲染内联 SVG，未知名称渲染为空。
- **Rationale**: 零新依赖、契约简单、满足 Button icon 与 Input clearable 的当下需求；图标集后续可按同契约扩展。
- **Trade-offs**: 内置集有限，新增图标需改组件内部 registry；但契约（`name`/`size`/`color`）不变。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 一组件一文件夹 + 分层文件 | 每个组件自持 index/src/style/types/test | 边界清晰、可并行实现、契合 structure.md | 三组件有重复样板 | 采纳，Button 作样板 |
| 集中式组件目录（单文件） | 组件散落为单个 .vue | 文件少 | 违反 structure.md、难扩展 | 拒绝 |

## Design Decisions

### Decision: 组件目录小写 kebab-case + PascalCase 组件名
- **Context**: 需在 structure.md 的大小写不一致中确定可发布的目录名。
- **Selected Approach**: 目录小写（`button`），文件与导出名 PascalCase（`src/Button.vue`、`AeroButton`）。
- **Rationale**: 对齐 `aero-ui/components/button` 发布 specifier 与 `./components/*` exports 直通。
- **Follow-up**: 验证 `import AeroButton from 'aero-ui/components/button'` 与 `aero-ui/components/input`、`aero-ui/components/icon` 均可解析。

### Decision: Icon 作为内置最小图标集组件
- **Context**: Button 的 icon 属性与 Input 的 clearable 清空图标都依赖图标渲染。
- **Selected Approach**: `AeroIcon` 以 `name`（string key）从内置 registry 渲染内联 SVG，`size`/`color` 控制尺寸与颜色，未知名称渲染为空。
- **Rationale**: 不引入新依赖，契约稳定可扩展。
- **Follow-up**: 实现时确认 `currentColor` 默认色与尺寸默认值（`1em`）。

## Risks & Mitigations
- 语义 token 名引用错误（如误用基础色板）—— 以「样式只含 `--aero-*`」为验证门禁，扫描组件样式产物。
- 三组件类型契约漂移 —— 以 `types.ts` 统一导出并在 `index.ts` 再导出，测试比对。
- 语言包文案 key 缺失 —— 补充 `components.*` 命名空间并加单测断言中英文案存在。

## References
- 语义 token 契约：`.kiro/specs/theme/design.md`（`--aero-*` 语义变量与明暗类名）。
- locale 契约：`.kiro/specs/i18n/design.md`（`useLocale`、`LanguagePack`、`zh-cn`/`en` 语言包）。
- 构建/导出契约：`.kiro/specs/foundation/design.md`（`./components/*` exports、`aero-ui/*` 别名）。
