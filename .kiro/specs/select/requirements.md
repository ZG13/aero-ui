# Requirements Document

## Introduction

本规范（select）的目标是在 aero-ui 组件库中新增**下拉选择**能力：实现 `AeroSelect`（下拉选择）与 `AeroOption`（选项）两个可复用组件，使下游应用能以声明式方式从一组选项中单选或多选一个/多个值，并支持可清空、可搜索、禁用选项与占位文案。API 面对齐 element-plus 的 `el-select`/`el-option` 核心面（`model-value`/`multiple`/`clearable`/`filterable`/`placeholder`/`disabled`/`size`）。作为首个表单控件，`AeroSelect` 消费 `form` spec 已确立的表单上下文契约，自动继承表单/表单项级 `size`/`disabled`，并在 blur/change 时触发字段即时校验。范围仅含 Select + Option，不实现远程搜索、选项分组、虚拟滚动、自定义模板、其它表单控件（Checkbox/Radio/Switch）。

## Boundary Context (Optional)

- **In scope**：`AeroSelect`、`AeroOption` 两个组件及其类型、样式与测试；单选/多选行为；可清空、可搜索（本地过滤）、选项禁用、占位文案；下拉面板的展开/收起与交互（外部点击关闭、Escape 关闭）；表单上下文集成（`size`/`disabled` 继承 + blur/change 触发字段即时校验）；组件 barrel 与根 barrel 聚合、`AeroUI` 全局注册；`--aero-*` 语义 token 消费约束；placeholder 相关 locale 文案；docs-site 中英双语文档 + 内嵌示例。
- **Out of scope**：远程搜索（`remote`/`filter-method`）、选项分组（`AeroOptionGroup`）、虚拟滚动（大量选项）、自定义选项模板插槽、`allow-create` 动态创建选项；其它表单控件（Checkbox/Radio/Switch 等，属后续 spec）。
- **Adjacent expectations**：`form` 已提供表单上下文（`size`/`disabled` 继承 + `validate(trigger)` 即时校验入口），本 spec 消费该契约，作为首个真实表单控件落地；`core-components` 已提供 `AeroIcon`（含 `close` 图标），本 spec 复用于清空/多选删除；`theme` 已提供 `--aero-*` 语义变量与明暗主题，本 spec 仅消费；`i18n` 已提供 `useLocale` 与 `zh-cn`/`en` 语言包骨架，本 spec 补充 placeholder 文案 key；`resolver` 的 `kebabCase` 映射已天然支持 `AeroSelect`，无需改动；`docs-site` 新增 select 双语文档。

## Requirements

### Requirement 1: 组件目录与导出契约
**Objective:** As a 组件库维护者，I want `AeroSelect` 与 `AeroOption` 遵循「一个组件一个文件夹」结构并导出统一契约，so that 组件可被一致地实现、复用与按需导入。

#### Acceptance Criteria
1.1 The 组件库 shall 以「一个组件一个文件夹」组织 `select`（承载 `AeroSelect` 与 `AeroOption` 两个组件），组件文件夹包含 `index.ts`、`src/Select.vue`、`src/Option.vue`、`style/index.scss`、`types.ts` 与 `__tests__/`。

1.2 The 组件库 shall 通过组件 `index.ts` 导出带 `install` 方法的 `AeroSelect` 与 `AeroOption`，并再导出其 `types.ts` 中的类型。

1.3 The 组件库 shall 使 `AeroSelect` 与 `AeroOption` 同时支持完整注册（`app.use`）与按需（局部）注册两种导入方式。

1.4 The 组件库 shall 仅在本规范范围内实现 `AeroSelect` 与 `AeroOption`，不实现远程搜索、选项分组、虚拟滚动、自定义模板等高级特性。

1.5 The 组件库 shall 通过组件 barrel `packages/components/index.ts` 与根 barrel `packages/index.ts` 聚合 re-export `select`，并将 `AeroSelect`/`AeroOption` 纳入 `AeroUI.install` 的全局注册。

### Requirement 2: 基础单选行为
**Objective:** As a 消费者，I want 一个可复用的 `AeroSelect` 下拉选择控件，so that 从一组声明式选项中单选一个值并受控回显。

#### Acceptance Criteria
2.1 The AeroSelect 组件 shall 提供绑定值属性（`model-value`），支持 `string`/`number` 类型，作为受控选中值。

2.2 The AeroSelect 组件 shall 通过 `AeroOption` 子组件声明选项，每个选项提供标签（`label`）与值（`value`）。

2.3 When 用户点击某个选项，the AeroSelect 组件 shall 将该选项的值更新到 `model-value` 并派发 `update:modelValue`。

2.4 The AeroSelect 组件 shall 在触发器上回显当前选中值对应选项的标签文案。

2.5 When 选中值为空（`undefined`/`null`/`''`），the AeroSelect 组件 shall 展示占位文案而非选中标签。

### Requirement 3: 多选行为
**Objective:** As a 消费者，I want `AeroSelect` 支持多选，so that 可同时选中多个值并以标签形式回显与删除。

#### Acceptance Criteria
3.1 When `multiple` 为 `true`，the AeroSelect 组件 shall 以数组形式绑定 `model-value`，支持选中多个选项。

3.2 When 用户在多选态点击某个选项，the AeroSelect 组件 shall 将该选项值加入/移出选中集合（toggle），并派发 `update:modelValue`。

3.3 When `multiple` 为 `true`，the AeroSelect 组件 shall 以标签形式在触发器内回显每个选中选项的标签。

3.4 When 用户点击多选标签上的删除入口，the AeroSelect 组件 shall 将该选项值移出选中集合并派发 `update:modelValue`。

3.5 When `multiple` 为 `false`（单选态），the AeroSelect 组件 shall 以单值而非数组绑定与回显。

### Requirement 4: 可清空与占位文案
**Objective:** As a 消费者，I want `AeroSelect` 支持可清空与占位文案，so that 可一键清除选中值并在空态展示提示。

#### Acceptance Criteria
4.1 When `clearable` 为 `true` 且当前有选中值，the AeroSelect 组件 shall 展示清空入口。

4.2 When 用户点击清空入口，the AeroSelect 组件 shall 清空选中值（单选清为 `undefined`，多选清为空数组）并派发 `update:modelValue` 与 `clear`。

4.3 The AeroSelect 组件 shall 提供占位文案属性（`placeholder`）；未提供时回退到 locale 默认文案。

4.4 When 选中值被清空，the AeroSelect 组件 shall 重新展示占位文案。

### Requirement 5: 可搜索（本地过滤）
**Objective:** As a 消费者，I want `AeroSelect` 支持可搜索，so that 选项较多时可通过输入关键词快速定位。

#### Acceptance Criteria
5.1 When `filterable` 为 `true`，the AeroSelect 组件 shall 在触发器内提供输入框，允许用户输入关键词。

5.2 When 用户输入关键词，the AeroSelect 组件 shall 在下拉面板中仅展示标签匹配关键词的选项（本地过滤，大小写不敏感）。

5.3 When `filterable` 为 `false`，the AeroSelect 组件 shall 不提供输入过滤，展示全部可用选项。

5.4 If 过滤后无匹配选项，the AeroSelect 组件 shall 展示空态提示。

### Requirement 6: 选项与禁用
**Objective:** As a 消费者，I want 选项支持禁用，so that 可禁止选择特定选项。

#### Acceptance Criteria
6.1 The AeroOption 组件 shall 提供禁用属性（`disabled`）。

6.2 When 某选项 `disabled` 为 `true`，the AeroSelect 组件 shall 展示该选项为禁用态，且用户无法选中。

6.3 The AeroSelect 组件 shall 提供整体禁用属性（`disabled`），禁用后不可展开下拉面板。

### Requirement 7: 下拉面板交互
**Objective:** As a 消费者，I want 下拉面板具备完整的展开/收起交互，so that 面板按预期打开、选择后收起、并在失焦/Escape 时关闭。

#### Acceptance Criteria
7.1 When 用户点击触发器，the AeroSelect 组件 shall 展开下拉面板；再次点击（或选中选项后）收起面板。

7.2 When 用户点击下拉面板之外的区域，the AeroSelect 组件 shall 收起面板。

7.3 When 用户按下 Escape 键，the AeroSelect 组件 shall 收起面板。

7.4 The AeroSelect 组件 shall 在面板展开/收起时派发 `visible-change` 事件，携带当前展开状态。

### Requirement 8: 表单上下文集成
**Objective:** As a 消费者，I want `AeroSelect` 作为表单控件自动继承表单/表单项级 `size`/`disabled` 并触发即时校验，so that 无需逐控件重复声明即可统一控制与校验。

#### Acceptance Criteria
8.1 While `AeroSelect` 位于 `disabled` 的 `AeroForm` 内，the AeroSelect 组件 shall 自动进入禁用态，除非自身显式声明 `disabled`。

8.2 While `AeroSelect` 位于已声明 `size` 的 `AeroForm` 内，the AeroSelect 组件 shall 自动采用表单级尺寸，除非自身显式声明 `size`。

8.3 While `AeroSelect` 位于已声明 `size`/`disabled` 的 `AeroFormItem` 内，the AeroSelect 组件 shall 优先采用表单项级声明，其次表单级，其次自身默认值。

8.4 When `AeroSelect` 位于表单或表单项内，the AeroSelect 组件 shall 在 blur/change 时触发所在字段的即时校验。

8.5 While `AeroSelect` 位于表单上下文之外，the AeroSelect 组件 shall 行为与现状一致（`size`/`disabled` 仅由自身 props 决定，不报错）。

### Requirement 9: 事件
**Objective:** As a 消费者，I want `AeroSelect` 派发清晰的事件，so that 可响应选中变化、清空与面板展开收起。

#### Acceptance Criteria
9.1 When 选中值变化，the AeroSelect 组件 shall 派发 `update:modelValue` 事件，携带最新值。

9.2 When 选中值变化，the AeroSelect 组件 shall 派发 `change` 事件，携带最新值。

9.3 When 用户点击清空入口，the AeroSelect 组件 shall 派发 `clear` 事件。

9.4 When 面板展开/收起，the AeroSelect 组件 shall 派发 `visible-change` 事件，携带当前展开状态。

### Requirement 10: 样式与语义 token 约束
**Objective:** As a 组件库维护者，I want 下拉选择样式只消费语义 `--aero-*` 变量并以 BEM 命名，so that 主题与品牌变更无需改动组件即可全局生效，明暗模式自动生效。

#### Acceptance Criteria
10.1 The 组件样式 shall 只引用 `--aero-*` 语义变量，禁止硬编码颜色、间距、圆角等视觉值。

10.2 The 组件样式 shall 禁止直接引用基础色板（例如 `--aero-blue-6` 或 SCSS `$blue-6`）。

10.3 The 组件 DOM 类名 shall 采用 BEM 命名（如 `aero-select`、`aero-select__trigger`、`aero-select__panel`、`aero-option` 与 `is-disabled`/`is-selected`/`is-open` 等状态修饰符）。

10.4 The 下拉面板与触发器视觉（边框、文本、悬浮态、选中态）shall 使用语义 token 呈现。

10.5 While 根元素应用 `.aero-theme-light` 或 `.aero-theme-dark`，the 组件 shall 自动呈现对应明暗主题的视觉。

### Requirement 11: 类型安全与编码约定
**Objective:** As a 组件库维护者，I want 下拉选择组件严格遵循类型安全与 `<script setup>` 编码约定，so that 组件实现一致、类型可被消费者依赖。

#### Acceptance Criteria
11.1 The 组件实现 shall 使用 `<script setup lang="ts">` 与 `defineProps<T>()`（含 `withDefaults`）、`defineEmits<T>()`，并禁用 Options API。

11.2 The 组件 props/emits 类型（如 `SelectProps`、`SelectEmits`、`OptionProps`）shall 定义在 `types.ts` 中，并从 `types.ts` 导出供消费者依赖。

11.3 The 组件类型定义 shall 遵循 TypeScript strict 模式，禁止使用 `any`。

11.4 The 每个组件 shall 提供共置的单元测试（`__tests__/`），覆盖其 props 行为、选择/多选/清空/搜索/禁用行为、事件、面板交互、错误态与上下文传递。
