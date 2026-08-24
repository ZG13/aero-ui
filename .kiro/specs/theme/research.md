# Research & Design Decisions

## Summary
- **Feature**: theme
- **Discovery Scope**: Extension（在既有 `base/` token 与 foundation 构建契约之上重构），执行 light discovery（参照式），无需外部 WebSearch。
- **Key Findings**:
  - `base/color.scss` 是 Arco Design 风格的完整色板：3 组灰阶（coolgrey / neutralgrey / warmgrey，各 10 阶）、base-black / base-white、opac 透明黑/白（各 11 阶）、11 个彩色系（pink / red / blue / lightblue / volcano / orange / yellow / green / cyan / purple / grape，各 10 阶 + `*-opac`）。
  - `base/number.scss` 内容混杂，实际包含四类 token：间距数字（`$number-n0`…`$number-nFull`）、字体族（`$typography-primitives-*`）、字号/行高/字重（`$typography-primitives-scale/line-height/weight-*`，其中 weight 存在 `100px` 与 `100` 重复定义、`Italic` 命名不一致等历史瑕疵）、透明度（`$opacity-*`，被误标注为「阴影」）。
  - foundation 已声明 `./theme/*` 的 exports 直通子路径与 `aero-ui` 路径别名，但未创建 `packages/theme/` 目录；`base/` 目录在 foundation 阶段保持只读。
  - steering `structure.md` 明确 theme 分层：`base/` 存基础 token，`light.scss` / `dark.scss` 按模式绑定语义 `--aero-*` 变量，`index.scss` 为主题入口；`tech.md` 明确组件只能消费 `--aero-*`，禁止直接引用基础色板，主题切换只用 `.aero-theme-light` / `.aero-theme-dark`。

## Research Log

### 基础 token 存量盘点
- **Context**: 确定迁移源内容与拆分边界，避免丢失或错拆 token。
- **Sources Consulted**: `base/color.scss`、`base/number.scss`。
- **Findings**:
  - 色板内容完整，`color.scss` 直接平移到 `packages/theme/base/color.scss` 即可，无需改值。
  - `number.scss` 中 `$typography-primitives-number` 的值为字体名 `DIN Alternate`，但命名带 `number`，易与间距数字混淆；迁移时应将字体族归入 `font.scss`，字号/行高/字重归入 `typography.scss`，透明度归入 `opacity.scss`，仅间距数字留在 `number.scss`。
  - 字重部分存在重复定义（`weight-ultra-light` 先声明为 `100px` 再声明为 `100`）与大小写不一致（`Italic` 混用），迁移时应规范化。
- **Implications**: 迁移不是纯搬移，需对 `number.scss` 做「按类型归类 + 轻微规范化」，但不得改变任何已有 token 的取值语义。

### 上一版 theme 结构与语义命名
- **Context**: 确定目标目录结构、语义 token 命名与明暗映射方式。
- **Sources Consulted**: `brief.md`、steering `structure.md`、steering `tech.md`、steering `product.md`。
- **Findings**:
  - 上一版结构为 `packages/theme/base/{color,number,radius,font,stroke,insets,opacity,typography,index}.scss` + `light.scss` / `dark.scss` / `index.scss`。
  - 语义命名遵循 `--aero-{语义}-{阶}`（如 `--aero-primary-6`、`--aero-text-main`、`--aero-radius-main`）。
  - 基础 token 当前以 SCSS `$变量` 形式存在；语义层为 CSS 自定义属性 `--aero-*`。组件只能消费语义层。
- **Implications**: 基础 token 保留 SCSS `$变量`（内部，编译后不输出），语义层以 CSS 自定义属性对外；`light.scss` / `dark.scss` 各自完整绑定同名 `--aero-*` 变量集。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| SCSS 基础变量 + CSS 自定义属性语义层 | 基础 token 为 SCSS `$变量`（`base/*.scss`），语义 `--aero-*` 在 `light.scss`/`dark.scss` 中绑定为 CSS 自定义属性 | 与现有 `base/` 源码零改动衔接；基础 token 编译后不泄漏到产物，天然禁止组件直接引用色板；语义层对浏览器可读 | 需正确处理 SCSS `@use`/`@forward` 与 `sass` 编译 | 采纳，与 steering `structure.md` 一致 |
| 全部 token 输出为 CSS 自定义属性 | 基础与语义均为 `--aero-*` 自定义属性 | 运行时可用 JS 读取基础值 | 基础色板会泄漏为 `--aero-blue-6`，违反「禁止引用基础色板」约束；需额外 lint 拦截 | 拒绝，违反需求 4.3 |
| 单一语义文件 + 变量别名 | 语义名直接 `var(--aero-*)` 链式指向基础 CSS 变量 | 少写映射 | 增加一层运行时 `var()` 间接引用，明暗切换需双份变量 | 拒绝，复杂度不必要 |

## Design Decisions

### Decision: 基础 token 保留 SCSS 变量、语义层用 CSS 自定义属性
- **Context**: 现有 `base/color.scss`/`number.scss` 以 SCSS `$变量` 形式存在，需求 4.3 要求组件禁止引用基础色板。
- **Alternatives Considered**:
  1. 基础 token 继续用 SCSS `$变量`，仅在 `light.scss`/`dark.scss` 中经 `@use './base'` 引用并输出 `--aero-*` 自定义属性。
  2. 基础 token 也输出为 `--aero-{色系}-{阶}` 自定义属性。
- **Selected Approach**: 选项 1 —— 基础 token 为 SCSS `$变量`，编译期被替换进语义自定义属性；基础变量不对外输出。
- **Rationale**: 与 steering `structure.md` 一致；从机制上保证「组件无法引用基础色板」（基础值不进产物），无需额外 lint 兜底。
- **Trade-offs**: 基础 token 不可在运行时被 JS 读取（非 CSS 自定义属性），但当前无此需求。
- **Follow-up**: 实施后验证编译产物中不含 `--aero-blue-6` 等基础色板变量。

### Decision: 明暗主题各自完整绑定同名语义变量，默认主题为 light
- **Context**: 需求 3 要求 `.aero-theme-light` / `.aero-theme-dark` 切换，且未指定类时需有默认值。
- **Alternatives Considered**:
  1. `light.scss` 输出 `:root, .aero-theme-light { ... }`，`dark.scss` 输出 `.aero-theme-dark { ... }`，语义名两文件一致。
  2. 仅 `:root` 定义 light，`.aero-theme-dark` 覆盖差异项。
- **Selected Approach**: 选项 1 —— light 同时作为默认主题（`:root`）与显式 `.aero-theme-light`；dark 通过 `.aero-theme-dark` 完整覆盖同名变量。
- **Rationale**: 默认 light 语义清晰；light/dark 两文件变量名严格一致，便于评审与下游消费；避免「部分覆盖」带来的变量遗漏风险。
- **Trade-offs**: 语义变量名在 light/dark 两文件各写一遍，存在漂移风险，通过「语义变量清单」任务固化契约 + 验证任务比对两文件变量名一致来兜底。
- **Follow-up**: 验证任务需比对 light/dark 输出的 `--aero-*` 变量名集合完全一致。

### Decision: 品牌色跨模式保持不变，仅中性色在明暗间反转
- **Context**: 明暗主题需确定哪些语义变量随模式变化。
- **Alternatives Considered**:
  1. 品牌色（primary/success/warning/danger/link）保持同一色系映射，仅 text/bg/border/fill 等中性色在 light 与 dark 间反转（dark 下深背景 + 浅文本）。
  2. 所有语义变量（含品牌色）都提供 light/dark 两套映射。
- **Selected Approach**: 选项 1 —— 品牌色映射到各自色系不变；中性色在 light 下用浅灰底 + 深文本，在 dark 下用深灰底 + 浅文本。
- **Rationale**: 与主流组件库的明暗策略一致；最小化 dark 映射面，降低漂移；当前组件（Button/Input/Icon）主要依赖中性色与少量品牌色。
- **Trade-offs**: 品牌色在 dark 下不做专门提亮，若后续需要可在此基础上扩展（不改语义名）。
- **Follow-up**: 实现时按设计的中性色映射表（text/bg/border/fill）逐项绑定。

### Decision: radius/stroke/insets 为新增基础 token 集
- **Context**: 需求 1.3 要求提供 `radius`/`stroke`/`insets` 基础文件，但现存量 `base/` 中无对应 token。
- **Alternatives Considered**:
  1. 新增小规模基础 token 集（radius 用 0/2/4/8/16/full，stroke 用 0/1/2/3/4，insets 用 0/2/4/8/12/16/20/24），值取自或对齐既有 `$number-n*` 间距尺度。
  2. 不新增，radius/stroke/insets 直接复用 `number` 的间距尺度。
- **Selected Approach**: 选项 1 —— 建立独立的 `radius`/`stroke`/`insets` 基础文件，取值为与既有间距尺度一致的固定档位，供语义层按语义名映射。
- **Rationale**: 满足 brief 的按类型拆分要求；独立文件使圆角/描边/内边距语义清晰，避免组件误用间距尺度表达圆角。
- **Trade-offs**: 新增少量 token 值，但均为对齐既有尺度的档位，无额外设计负担。
- **Follow-up**: 实施时确认 radius/stroke/insets 档位与 `number` 尺度一致，语义映射表固定。

## Risks & Mitigations
- `number.scss` 字重 token 存在重复定义与命名不一致 —— 迁移时规范化（去重、统一命名），并以「不改变取值语义」为约束。
- light/dark 语义变量名漂移 —— 以「语义变量清单」为契约，验证任务比对两文件变量名集合一致。
- 基础色板泄漏到产物（如 `--aero-blue-6`）—— 基础 token 用 SCSS 变量不输出为自定义属性，验证任务检查产物不含基础色板变量。
- `sass` 编译未在 foundation 验证 —— 主题入口需能被 `sass` 正常编译，集成任务以编译通过 + 产物含 `.aero-theme-light`/`.aero-theme-dark` 为验收口径。

## References
- steering `structure.md` — theme 目录模式与 `--aero-{语义}-{阶}` 命名约定。
- steering `tech.md` — 设计系统消费约束（只准用 `--aero-*`、禁用 `.dark`）。
- steering `product.md` — 语义 token 与明暗主题的产品定位。
- `.kiro/specs/foundation/design.md` — `./theme/*` exports 直通子路径与 `aero-ui` 别名契约。
- `base/color.scss` / `base/number.scss` — 迁移源 token 存量。
