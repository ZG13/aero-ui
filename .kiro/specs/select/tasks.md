# Implementation Plan

## 任务格式说明
- 序号按「阶段 → 子任务」层级；排序即依赖（后序任务隐式依赖前序）。
- `(P)` 标记可并行执行的任务（无数据依赖、无共享文件、边界不重叠）。
- `_Requirements:` 仅列数值需求 ID；`_Boundary:` 标注组件边界；`_Depends:` 标注跨边界非显式依赖。

- [x] 1. 类型契约与选项上下文（Foundation）
- [x] 1.1 (P) 定义 select 公共类型：SelectProps、SelectEmits、OptionProps、SelectSize
  - `SelectProps` 覆盖 modelValue（单选 string|number、多选数组）/multiple/clearable/filterable/placeholder/disabled/size；`SelectEmits` 覆盖 update:modelValue/change/clear/visible-change；`OptionProps` 覆盖 label/value/disabled
  - `SelectSize` 与 `FormSize` 同值语义（large/main/small）；`disabled` 无 @default 以区分「未声明」与「声明 false」
  - 所有类型含 JSDoc @default 且无 any，`value` 支持 string|number|boolean
  - 可观察完成：类型文件通过 vue-tsc 类型检查且无 any
  - _Requirements: 1.2, 2.1, 3.1, 4.3, 6.1, 9.1, 11.2, 11.3_
- [x] 1.2 (P) 定义 selectContextKey 与选项注册上下文类型
  - 定义 Symbol injection key（selectContextKey）与 SelectContext 类型，承载选项数组、注册/注销、选中判定与选中上报
  - 对齐 form 的 formContextKey 范式（Symbol key，禁止字符串 key）
  - 可观察完成：常量文件通过 vue-tsc 类型检查
  - _Requirements: 1.2, 2.2, 11.3_
  - _Boundary: select-constants_

- [x] 2. 组件实现（Core）
- [x] 2.1 (P) 实现 AeroOption 选项组件
  - 挂载时 inject selectContextKey 并注册自身（label/value/disabled），卸载时注销
  - 渲染选项行：展示 label，按选中/禁用态应用 is-selected/is-disabled 修饰符，点击经 context 上报选中
  - 可观察完成：AeroOption 在 AeroSelect 内可渲染并注册，点击触发选中上报
  - _Requirements: 2.2, 6.1, 6.2, 10.3_
  - _Boundary: option_
- [x] 2.2 (P) 实现 select 样式
  - .aero-select / .aero-select__trigger / .aero-select__panel / .aero-option 的 BEM 类与布局（触发器、面板、选项行、选中态、禁用态、展开态）
  - 下拉箭头用 CSS 绘制（currentColor），清空/删除复用 AeroIcon 的 close；仅消费 --aero-* 语义 token
  - 可观察完成：明暗主题下样式正确，无硬编码视觉值
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - _Boundary: select-style_
- [x] 2.3 (P) 实现 AeroSelect 单选与清空占位
  - 触发器回显当前选中值对应选项 label（找不到匹配回退展示 value），空值展示 placeholder（缺省回退 locale 文案）
  - clearable 有值时展示清空入口，点击清空（单选清为 undefined）并派发 update:modelValue/change/clear
  - 点击选项更新 modelValue 并派发 update:modelValue/change；disabled 时不可展开
  - 可观察完成：单选选中/回显/清空/占位/整体禁用行为正确
  - _Requirements: 2.3, 2.4, 2.5, 4.1, 4.2, 4.4, 6.3, 9.1, 9.2, 9.3_
  - _Boundary: select_
- [x] 2.4 实现 AeroSelect 多选与可搜索
  - multiple 时以数组绑定，点击选项 toggle 加入/移出，触发器以标签回显（含删除入口），删除入口移出值并派发 update:modelValue
  - filterable 时触发器内提供输入框，输入关键词本地过滤选项（label 匹配、大小写不敏感），无匹配展示空态
  - 可观察完成：多选 toggle/标签删除/搜索过滤/空态行为正确
  - _Depends: 2.3_
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 9.1, 9.2_
  - _Boundary: select_
- [x] 2.5 实现下拉面板交互
  - 点击触发器展开面板，选中选项或再次点击收起；点击面板外区域、按下 Escape 收起
  - 面板展开/收起时派发 visible-change(visible)；teleport 到 body 定位容器相对触发器定位
  - 可观察完成：展开/收起/外部点击/Escape/visible-change 行为正确
  - _Depends: 2.3_
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.4_
  - _Boundary: select-popup_
- [x] 2.6 实现表单上下文集成
  - 复用 form 的 useFormSize/useFormDisabled 解析 size/disabled（自身 → 表单项 → 表单 → 默认），disabled 显式默认 undefined
  - blur/change 时调用 formItemContext?.validate('blur'|'change') 触发字段即时校验（fire-and-forget 副作用）
  - 表单上下文之外安全降级为独立控件（size/disabled 仅由自身 props 决定，不报错）
  - 可观察完成：置于 AeroForm/AeroFormItem 内自动继承 size/disabled 并在 blur/change 触发校验，独立使用行为不变
  - _Depends: 2.3_
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - _Boundary: select-form-integration_

- [x] 3. 集成（Integration）
- [x] 3.1 (P) barrel 聚合与全局注册
  - components/index.ts 与根 barrel 追加 select 导出，AeroUI.install 注册 AeroSelect/AeroOption
  - 可观察完成：import { AeroSelect, AeroOption } from 'aero-ui' 与 app.use(AeroUI) 均可解析
  - _Requirements: 1.1, 1.3, 1.5_
- [x] 3.2 (P) 补充 locale 占位文案
  - 在 zh-cn 与 en 语言包补充 components.select.placeholder 默认文案
  - 可观察完成：两语言 key 对齐，缺省 placeholder 随语言切换
  - _Requirements: 4.3_
  - _Boundary: locale_

- [x] 4. 测试（Validation）
- [x] 4.1 (P) AeroSelect 单元测试
  - 单选选中/回显/清空、多选 toggle/标签删除、搜索过滤/空态、禁用、面板展开收起/visible-change、事件载荷
  - 可观察完成：测试通过，覆盖上述行为
  - _Requirements: 2.3, 2.4, 2.5, 3.2, 3.3, 3.4, 4.2, 5.2, 5.4, 6.3, 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.3, 9.4, 11.4_
  - _Boundary: select-test_
- [x] 4.2 (P) AeroOption 与表单集成测试
  - 选项注册/禁用/选中态；置于 AeroForm+AeroFormItem 内 size/disabled 继承（自身→表单项→表单优先级）、blur/change 触发字段校验、表单外独立使用行为不变
  - 可观察完成：测试通过，覆盖上述行为
  - _Requirements: 2.2, 6.1, 6.2, 8.1, 8.2, 8.3, 8.4, 8.5, 11.4_
  - _Boundary: option-test, select-form-integration-test_

- [x] 5. 文档站接入（Integration）
- [x] 5.1 编写 select 双语文档并接入文档站
  - 编写 docs/zh-CN/components/select.md 与 docs/en-US/components/select.md，覆盖单选/多选/清空/搜索/禁用/表单集成用法示例与完整 API 表格（Attributes/Events/Slots）
  - config.mts 双语侧边栏追加 Select 入口，theme/index.ts 注册 AeroSelect/AeroOption 并引入 select 样式
  - 可观察完成：docs:build 成功，双语 select 页面可访问，示例渲染正常
  - _Depends: 3.1_
  - _Requirements: 1.4_
  - _Boundary: select-docs_

## Implementation Notes

- 表单集成复用 `packages/components/form/src/use-form.ts` 的 `useFormSize`/`useFormDisabled`，不重造继承逻辑；`disabled` 显式默认 `undefined` 以绕过 Vue 布尔 prop 的「未声明→false」强转（对齐 AeroInput 范式）。
- 下拉箭头用 CSS 绘制（`currentColor`），清空/多选删除复用 `AeroIcon` 的 `close`；不为本组件新增图标资产。
- `AeroResolver` 的 `kebabCase` 已自动映射 `AeroSelect`/`AeroOption` 到 `aero-ui/components/select`，无需改动 resolver。
