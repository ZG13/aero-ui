# Implementation Plan

## 任务格式说明
- 序号按「阶段 → 子任务」层级；排序即依赖（后序任务隐式依赖前序）。
- `(P)` 标记可并行执行的任务（无数据依赖、无共享文件、边界不重叠）。
- `_Requirements:` 仅列数值需求 ID；`_Boundary:` 标注组件边界；`_Depends:` 标注跨边界非显式依赖。

- [ ] 1. 表单类型契约（Foundation）
- [x] 1.1 定义 form 公共类型：FormProps、FormEmits、FormRules、FormItemRule、FormSize、ValidateFieldsError
  - 类型覆盖 model/rules/label-width/label-position/inline/size/disabled/show-message/status-icon 等表单容器属性
  - FormItemRule 支持 required/min/max/len/pattern/type/enum/validator/asyncValidator/message/trigger
  - FormRules 为 Record<字段名, FormItemRule | FormItemRule[]>，ValidateFieldsError 为按字段名组织的错误结构
  - 所有类型含 JSDoc @default 且无 any
  - 可观察完成：类型文件通过 vue-tsc 类型检查且无 any
  - _Requirements: 8.2, 8.3_
- [x] 1.2 定义 form-item 公共类型：FormItemProps、FormItemEmits、FormItemValidateState
  - 覆盖 prop/label/required/rules/error/show-message/size 等表单项属性
  - FormItemValidateState 表达校验状态（空/错误）与校验消息
  - 复用 1.1 的 FormItemRule，不重复定义
  - 可观察完成：类型文件通过 vue-tsc 类型检查
  - _Requirements: 8.2_
- [x] 1.3 声明 async-validator 依赖，并补充 locale 校验文案
  - package.json 声明 async-validator 依赖（bundle 进产物，无需加入 vite external）
  - 在 zh-cn 与 en 语言包补充 components.form.rules.* 默认校验文案（required/min/max/len/pattern/type 等）
  - 可观察完成：pnpm 安装后类型可解析，语言包含 form 校验文案且两语言 key 对齐
  - _Requirements: 7.1, 7.3_
  - _Boundary: foundation, locale_

- [ ] 2. 校验引擎与上下文契约（Core）
- [x] 2.1 (P) 实现校验引擎适配：严格类型 → async-validator 规则，错误归一化
  - 将 FormItemRule 适配为 async-validator 规则项，受控 as 边界仅存在于本模块
  - 校验失败时返回按字段名组织的 { message, field } 错误结构
  - 规则缺失 message 时回退 locale 默认文案；按 trigger 过滤应执行的规则
  - 可观察完成：单字段校验函数可被调用，通过/失败结果符合 ValidateFieldsError 结构
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 7.1_
  - _Boundary: validator_
- [x] 2.2 (P) 实现上下文契约：injection key 常量与 size/disabled 继承 hook
  - 定义 formContextKey / formItemContextKey（Symbol）及 FormContext / FormItemContext 类型
  - 实现 useFormSize / useFormDisabled，优先级为自身 prop → formItem → form → 默认值
  - FormItemContext 含 validate(trigger) 入口供子控件触发校验
  - 可观察完成：hook 在无上下文时返回默认值，有上下文时正确继承
  - _Requirements: 5.1, 5.2, 5.3_
  - _Boundary: form-context_
- [x] 2.3 改造 AeroInput 消费表单上下文与触发校验
  - Input 的 size/disabled 改为经 useFormSize / useFormDisabled 解析
  - Input 的 size 类型与 FormSize（large/main/small）对齐，无上下文时行为与现状一致
  - Input 在 blur/change 事件时调用所在 formItem 的 validate(trigger)（若在表单项内）
  - 可观察完成：Input 在表单内自动继承 size/disabled，并在 blur/change 触发字段即时校验，独立使用行为不变
  - _Requirements: 5.4, 4.3_
  - _Boundary: input_
  - _Depends: 2.2_

- [ ] 3. 组件实现（Core）
- [x] 3.1 实现 AeroForm 容器与字段注册生命周期
  - provide formContext（reactive），字段注册 addField/removeField，卸载时注销
  - 布局属性（label-width/label-position/inline/size/disabled/show-message/status-icon）落地到容器渲染
  - 可观察完成：AeroForm 可渲染并承载 model/rules，内部字段注册/注销无泄漏
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.1_
  - _Boundary: form_
- [x] 3.2 实现 AeroForm 校验方法与事件
  - 实现 validate（聚合遍历字段，失败 reject ValidateFieldsError）、validateField、resetFields、clearValidate、scrollToField
  - resetFields 恢复初始值并清校验，clearValidate 清指定/全部；校验完成触发 validate 事件（prop/isValid/message）
  - 无 prop 的字段不纳入校验与重置
  - 可观察完成：validate 返回聚合结果，resetFields/clearValidate 正确更新字段状态
  - _Requirements: 2.7, 2.8, 2.9, 4.5, 4.6, 4.7, 8.1_
  - _Boundary: form_
- [x] 3.3 实现 AeroFormItem 表单项
  - inject formContext、provide formItemContext，挂载时注册字段、卸载时注销
  - 渲染 label（必填星号）、默认内容插槽、错误消息、错误态与 status-icon（AeroIcon）
  - 字段级 validate(trigger)（按 trigger 过滤规则）/resetField/clearValidate，更新 validateState/validateMessage
  - 可观察完成：AeroFormItem 展示 label/内容/状态图标，校验失败时展示错误并进入错误态，blur/change 触发对应即时校验
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.3, 5.1, 5.2, 5.3, 8.1_
  - _Boundary: form-item_
- [x] 3.4 (P) 实现表单与表单项样式
  - .aero-form 与 .aero-form-item 的 BEM 类名与布局（label 位置/宽度、行内、错误态、必填星号）
  - 仅消费 --aero-* 语义 token，错误态用 --aero-danger-* 与 --aero-border-*
  - 可观察完成：明暗主题下样式正确，错误态视觉符合语义 token 约束
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - _Boundary: form-style, form-item-style（本任务有意跨 form/form-item 两个样式文件，因共享 token 与布局规范）_

- [ ] 4. 集成（Integration）
- [x] 4.1 barrel 聚合与全局注册
  - components/index.ts 与根 barrel 追加 form/form-item 导出，AeroUI.install 注册 AeroForm/AeroFormItem
  - 可观察完成：import { AeroForm, AeroFormItem } from 'aero-ui' 与 app.use(AeroUI) 均可解析
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5. 测试（Validation）
- [x] 5.1 (P) Form 与校验引擎单元测试
  - validate 多字段成功/失败聚合、resetFields、clearValidate、validateField、validate 事件载荷
  - validator 规则（required/min/max/len/pattern/type/validator/asyncValidator）通过/失败、默认文案、trigger 过滤
  - 切换 locale 后默认错误文案随语言自动更新
  - 可观察完成：测试通过，覆盖上述行为
  - _Requirements: 8.4, 7.2_
  - _Boundary: form-test_
- [ ] 5.2 (P) FormItem 单元测试
  - prop 缺失不参与校验、required 星号、错误态更新、label/error 插槽、字段级 resetField/clearValidate
  - 可观察完成：测试通过，覆盖上述行为
  - _Requirements: 8.4_
  - _Boundary: form-item-test_
- [ ] 5.3 (P) Input 上下文继承与触发校验测试
  - 置于 form 上下文中 size/disabled 继承、字段级覆盖表单级、Input 自身 props 最高优先
  - blur/change 触发字段即时校验（trigger 场景）
  - 可观察完成：测试通过，覆盖继承优先级与触发校验
  - _Requirements: 8.4_
  - _Boundary: input-test_

## Implementation Notes

- 2.2 reviewer 跨任务契约：`FormItemContext.disabled` 为 `boolean`（非 undefined），任务 3.3 的 FormItem 必须在 `provide(formItemContextKey, ...)` 前折叠表单级 disabled（`formItemProps.disabled ?? formContext.disabled`），否则「未声明」与「声明 false」无法区分，表单级 disabled 会被吞掉。

- 3.1 reviewer 交接（供 3.2/3.3）：(1) `Form.vue` 中 5 个校验方法为 stub，`TODO(3.2)` 标记 ×3（resetFields/clearValidate/scrollToField）；`validate`/`validateField` 无条件 resolve `true` 且**无** TODO 标记，3.2 必须**先**替换这两个（最高风险地雷），再实现其余并删除全部 TODO 标记。(2) `fields` 暴露在 provide 的 context 但不在 `FormContext` 接口（constants.ts）——设计里 `fields` 应保持内部，3.2 的聚合方法在 Form.vue 内闭包直接引用 `fields` ref 即可，勿放进公开 `FormContext`。(3) `labelSuffix`/`scrollToError` 本任务未消费：`scrollToError` 由 3.2 消费，`labelSuffix` 需 3.3 决定下传或移除。

- 3.2 reviewer 架构缺口（**必须在 3.3 解决**）：`Form.validate()` 现直接委托 `validateFieldValue`，绕过了 `FormItemContext.validate()`，导致 (a) 提交校验失败时不更新 FormItem 的 `validateState`/`validateMessage`（需求 3.7 错误展示失效）；(b) FormItem 级 `rules`（需求 3.4）被 form 级校验忽略。根因：`constants.ts` 中 `FormItemContext.validate` 被 2.2 定为 `Promise<void>`，无法向聚合方返回错误载荷。3.3 需**修改 `constants.ts`**：让 `FormItemContext.validate(trigger?)` 返回/拒绝携带字段错误列表（如 `Promise<Array<{message,field}>>` 或 reject `ValidateFieldsError[prop]`），并让 `Form.validate()` 遍历 `fields` 调 `field.validate(undefined)` 聚合——恢复设计「字段级状态收敛于 FormItem」的不变量，使 form 级与 item 级 rules 走同一路径。此改动对 `AeroInput` 的 blur/change 调用点（仅副作用）非破坏。
