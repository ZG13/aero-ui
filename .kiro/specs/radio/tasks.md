# Implementation Plan

## 1. 基础契约（Foundation）

- [x] 1.1 定义 radio 类型契约（types.ts）
  - 定义 RadioValue（string | number | boolean）与 RadioSize（large | main | small），唯一定义于 types.ts 并由其余文件导入
  - 定义 BaseRadioOptionProps（value / label / disabled / name），label 标注 @deprecated 兼容别名，语义同 value
  - 定义 RadioProps（继承 BaseRadioOptionProps，增 modelValue / border / size）、RadioButtonProps（增 modelValue）、RadioGroupProps（modelValue / size / disabled / fill / textColor / name / validateEvent / label）
  - 定义 RadioEmits / RadioGroupEmits（update:modelValue 与 change）
  - 每个字段带中文 JSDoc 与 @default；禁用 any
  - 完成标志：types.ts 导出完整且字段均含 JSDoc，经 tsc 检查无类型错误
  - _Requirements: 1.9_

- [x] 1.2 定义分组上下文契约（constants.ts）
  - 定义 RadioGroupContext 接口（modelValue / size / disabled / name / fill / textColor / changeEvent）
  - 定义 radioGroupContextKey（InjectionKey<RadioGroupContext>，Symbol）
  - 从 types.ts 导入 RadioValue / RadioSize（不重复定义）
  - 完成标志：constants.ts 从 types.ts 正确导入类型，上下文契约字段与 design.md 一致
  - _Requirements: 2.1, 2.2_

## 2. 核心组件（Core）

- [x] 2.1 (P) 实现 AeroRadio 圆点单选
  - 渲染「圆点 + 文案」选项，底层叠加透明原生 radio input（aria-checked、name 透传）
  - 实现值解析（value ?? label）与选中判定（(context.modelValue ?? props.modelValue) === optionValue）
  - 点击未选中项：group 内调 changeEvent，独立时 emit update:modelValue + change 并触发 change 校验；点击已选中项不变化
  - 实现 disabled / border / size 三态
  - 完成标志：独立与 group 两种场景下选中态、change、disabled/border/size 均按需求 1.x 表现
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 4.3, 5.1, 5.2, 5.3_
  - _Boundary: AeroRadio_

- [x] 2.2 (P) 实现 AeroRadioButton 按钮单选
  - 按钮外观渲染单选；独立实现与 Radio 相同的值解析/选中判定/点击派发规则（不共享逻辑文件，与 2.1 并行安全）
  - 选中态以 fill 为背景、textColor 为文字色，缺省回退默认主题色
  - 实现 disabled 态；支持脱离 group 独立使用（按自身 modelValue 呈现）
  - 完成标志：按钮样式选中/激活/禁用及独立使用均按需求 3.x 表现
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1_
  - _Boundary: AeroRadioButton_

- [x] 2.3 (P) 实现 AeroRadioGroup 分组容器
  - provide(radioGroupContextKey) 下发 modelValue / size / disabled / name / fill / textColor / changeEvent
  - size 经 useFormSize 解析、disabled 经 useFormDisabled 解析（子项自身优先）
  - changeEvent 派发 update:modelValue 与 change；validateEvent !== false 时调 formItemContext.validate('change')
  - 完成标志：组内互斥、值绑定、size/disabled/name/fill/textColor 下发与校验触发均按需求 2.x / 4.x 表现
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 4.1, 4.2, 5.2_
  - _Boundary: AeroRadioGroup_

- [x] 2.4 (P) 实现 radio 样式（style/index.scss）
  - BEM 类：.aero-radio / .aero-radio-group / .aero-radio-button
  - 实现 checked / disabled / border / size（large/main/small）修饰符与按钮激活态（fill/textColor 变量落地）
  - 仅消费语义 --aero-* token（边框/背景/主色/文字/圆角/间距/禁用透明度），无硬编码颜色
  - 完成标志：样式文件编译通过，BEM 类名与修饰符符合 design.md 契约，仅含语义 token（视觉联动在 3.2 与 4.x 中联合验证）
  - _Requirements: 1.2, 1.5, 1.6, 1.7, 2.7, 3.2, 3.3, 3.4_
  - _Boundary: radio 样式_

## 3. 导出与文档集成（Integration）

- [x] 3.1 建立组件导出契约与 barrel 登记
  - radio/index.ts 导出 AeroRadio / AeroRadioGroup / AeroRadioButton（各带 install）并 re-export types
  - components/index.ts 追加 export * from './radio'
  - packages/index.ts import 三组件并在 AeroUI.install 中 app.use(...)
  - 本任务为 design.md 指定的导出/barrel 交付物，无独立需求 ID 对应
  - 完成标志：`import { AeroRadio, AeroRadioGroup, AeroRadioButton } from 'aero-ui/components/radio'` 与 `app.use(AeroUI)` 均可解析并注册三组件

- [x] 3.2 文档站注册与双语文档
  - docs/.vitepress/theme/index.ts：import 三组件、app.use、追加 radio 样式 import
  - docs/.vitepress/config.mts：zh-CN / en-US sidebar 各加 Radio 条目
  - 新增 docs/zh-CN/components/radio.md 与 docs/en-US/components/radio.md（基础用法 / 禁用 / 尺寸 / 边框 / 按钮样式 / 表单集成演示）
  - 依据项目约定「组件变更必须同步双语文档站」，本任务纳入集成阶段
  - 完成标志：pnpm docs:dev 下双语文档页渲染三组件演示且可交互

## 4. 测试（Validation）

- [x] 4.1 (P) AeroRadio 单元测试
  - 覆盖选中态切换、点击未选/已选、disabled、border/size/name、value/label 兼容、脱离表单不抛错、原生 input 渲染
  - 完成标志：pnpm test 中 Radio 用例通过
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 4.3, 5.1_
  - _Boundary: Radio 测试_

- [x] 4.2 (P) AeroRadioGroup 单元测试
  - 覆盖组内唯一选中、值绑定与 change、size/disabled/name/fill/textColor 下发、validateEvent、表单 size/disabled 继承与 change 校验（provide 模拟 form context）
  - 完成标志：pnpm test 中 RadioGroup 用例通过
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 4.1, 4.2, 5.2_
  - _Boundary: RadioGroup 测试_

- [x] 4.3 (P) AeroRadioButton 单元测试
  - 覆盖按钮外观渲染、fill/textColor 激活态与缺省主题色、disabled、脱离 group 独立使用
  - 完成标志：pnpm test 中 RadioButton 用例通过
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - _Boundary: RadioButton 测试_
