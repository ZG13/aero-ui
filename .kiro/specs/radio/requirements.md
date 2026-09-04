# Requirements Document

## Introduction

aero-ui 目前已有 form 上下文契约与 select / input-number / date-picker 等表单控件，但缺少「单选」这一基础表单能力。本 spec 封装 `AeroRadio` / `AeroRadioGroup` / `AeroRadioButton` 三个组件，完整对齐 element-plus radio 家族 API，消费 form 上下文（size/disabled 继承、change 触发校验），支持圆点与按钮两种视觉样式、原生键盘与屏幕阅读器支持，并配套中英双语文档与按需导入。

## Boundary Context

- **In scope**: `AeroRadio`（圆点样式）、`AeroRadioGroup`（分组容器）、`AeroRadioButton`（按钮样式）；分组互斥与值绑定；圆点/按钮两种视觉样式；size/disabled 继承与 change 校验；键盘导航与原生 radio 语义；中英双语文档与按需导入。
- **Out of scope**: checkbox、switch 等其它选择控件；多选；级联选择；自定义渲染插槽之外的高级定制；radio 组件无内置可翻译文案，不新增 i18n 词典项。
- **Adjacent expectations**: 依赖 form 上下文契约（size/disabled 继承、change 触发校验）但不修改该契约；复用 theme 语义 token 与 resolver 按需导入，但不新增 token。

## Requirements

### Requirement 1: 单选项（AeroRadio）基础行为

**Objective:** As a 使用组件库的开发者, I want 用 `AeroRadio` 展示一个带值的圆点单选项, so that 用户能从互斥选项中明确选择其一。

#### Acceptance Criteria
1. The AeroRadio 组件 shall 以「圆点 + 选项文案」的形式渲染一个可点击的单选项。
2. When 绑定值等于该选项的值, the AeroRadio 组件 shall 呈现选中态（圆点高亮）。
3. When 用户点击一个未选中的 AeroRadio, the AeroRadio 组件 shall 将绑定值更新为该选项的值并触发 change 事件（携带新值）。
4. When 用户点击一个已选中的 AeroRadio, the AeroRadio 组件 shall 保持选中态不变，且不改变绑定值、不触发 change 事件。
5. When `disabled` 为 true, the AeroRadio 组件 shall 呈现禁用视觉态且不响应点击。
6. When `border` 为 true, the AeroRadio 组件 shall 显示外边框样式。
7. When `size` 为 large / main / small, the AeroRadio 组件 shall 应用对应尺寸的视觉样式。
8. When `name` 已设置, the AeroRadio 组件 shall 将其透传到原生 radio 的 name 属性。
9. The AeroRadio 组件 shall 同时支持 `value` 与 `label` 两个 prop 表达选项值，二者语义一致（`label` 为兼容别名）。

### Requirement 2: 分组容器（AeroRadioGroup）

**Objective:** As a 使用组件库的开发者, I want 用 `AeroRadioGroup` 管理一组互斥的选项, so that 绑定一个值即可控制组内唯一选中项。

#### Acceptance Criteria
1. The AeroRadioGroup 组件 shall 接受一个绑定值，并确保组内同时至多一个选项处于选中态。
2. When 绑定值匹配某个子选项的值, the AeroRadioGroup 组件 shall 让该子选项呈现选中态。
3. When 用户选择组内某个选项, the AeroRadioGroup 组件 shall 将绑定值更新为该选项的值并触发 change 事件（携带新值）。
4. When `size` 已设置, the AeroRadioGroup 组件 shall 将该尺寸应用于组内所有子选项（子项自身 `size` 优先）。
5. When `disabled` 为 true, the AeroRadioGroup 组件 shall 禁用组内所有子选项。
6. When `name` 已设置, the AeroRadioGroup 组件 shall 将同一 name 透传给组内所有子选项的原生 radio，使它们属于同一原生分组。
7. When `fill` / `textColor` 已设置, the AeroRadioGroup 组件 shall 将其应用于按钮样式子项的选中态背景色与文字色。
8. When `validateEvent` 为 false, the AeroRadioGroup 组件 shall 在值变化时不触发表单校验。

### Requirement 3: 按钮样式（AeroRadioButton）

**Objective:** As a 使用组件库的开发者, I want 用 `AeroRadioButton` 提供按钮外观的单选, so that 在紧凑分段场景中呈现互斥选项。

#### Acceptance Criteria
1. The AeroRadioButton 组件 shall 以按钮外观渲染一个单选项，并继承所在 RadioGroup 的值绑定与选中态。
2. When 该选项被选中, the AeroRadioButton 组件 shall 以 `fill` 作为背景色、`textColor` 作为文字色呈现激活态。
3. When 未设置 `fill` / `textColor`, the AeroRadioButton 组件 shall 使用默认主题色呈现激活态。
4. When `disabled` 为 true, the AeroRadioButton 组件 shall 呈现禁用态且不响应点击。
5. If AeroRadioButton 未置于 AeroRadioGroup 内, the AeroRadioButton 组件 shall 仍可独立使用并按自身绑定值呈现选中态。

### Requirement 4: 表单集成

**Objective:** As a 使用组件库的开发者, I want radio 家族自动继承表单的 size / disabled 并触发校验, so that 在 AeroForm 中开箱即用。

#### Acceptance Criteria
1. While 组件位于 AeroFormItem 内, the AeroRadioGroup 组件 shall 继承表单上下文的 `size` 与 `disabled`（自身显式设置优先）。
2. While 组件位于 AeroFormItem 内, when 绑定值发生变化, the AeroRadioGroup 组件 shall 触发该表单项的 change 校验。
3. If 组件未置于表单内, the radio 组件 shall 仍可独立使用且不抛错。

### Requirement 5: 可访问性与键盘操作

**Objective:** As a 使用组件库的开发者, I want radio 具备原生键盘与屏幕阅读器支持, so that 组件满足无障碍使用要求。

#### Acceptance Criteria
1. The radio 组件 shall 使用原生 radio 语义，使屏幕阅读器能读出选中状态与标签。
2. When 焦点位于组内某个选项, the AeroRadioGroup 组件 shall 支持方向键在组内切换选中项。
3. When 焦点位于组内某个选项, the radio 组件 shall 支持空格键选中当前聚焦项。
