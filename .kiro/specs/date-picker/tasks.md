# Implementation Plan

## Task Format

任务按「基础 → 核心 → 集成 → 校验」顺序排列；顺序本身即隐式依赖。2.x 组件子任务编辑同一组件文件，保持顺序执行；3.x/5.x 触及不同文件，标注 `(P)` 可并行。

---

- [x] 1. Foundation：依赖、类型与纯逻辑
- [x] 1.1 引入 dayjs 依赖并配置构建外部化
  - `package.json` 新增 `dayjs`（^1.11.x）；`vite.config.ts` 将 `dayjs` 加入 rollup `external`（对齐 @vueuse/core）
  - 完成态：`pnpm install` 后 dayjs 可导入，构建产物不内联 dayjs
  - _Requirements: 1.4_

- [x] 1.2 定义 `DatePickerProps`/`DatePickerEmits`/`DatePickerType` 公开类型契约
  - 类型含全部 props（`modelValue`/`type`/`format`/`value-format`/`placeholder`/`start-placeholder`/`end-placeholder`/`disabled`/`size`/`disabled-date`/`clearable`/`editable`）与事件（`update:modelValue`/`change`/`clear`/`visible-change`）
  - JSDoc `@default` 齐全（`type='date'`、`format='YYYY-MM-DD'`、`editable=true`、`size='main'`），严格 `no-any`
  - 完成态：`types.ts` 导出后 `index.ts` 可 re-export，消费者可依赖
  - _Requirements: 1.2, 12.2, 12.3_

- [x] 1.3 实现日期纯函数模块 `src/date.ts`
  - dayjs 薄封装：`parse`/`format`/`buildMonth`（6×7 日期矩阵）/`isSameDay`/`isInRange`
  - 无副作用，封装 dayjs 调用，避免组件散落日期逻辑
  - 完成态：月历生成、范围判断、格式化断言通过（`date.test.ts`）
  - _Requirements: 5.1, 5.2, 5.3, 3.5_
  - _Boundary: date.ts_

- [x] 1.4 实现通用弹层定位 hook `packages/hooks/use-popper.ts`
  - 接收触发器/面板 ref，返回 `open`/`panelStyle`/`openPanel`/`close`/`toggle`
  - 展开时按触发器 `getBoundingClientRect` 定位（fixed + viewport 坐标）；滚动/resize 收起；click-outside 与 Escape 关闭
  - 完成态：弹层对齐触发器定位、滚动/resize/外部点击/Escape 均收起
  - _Requirements: 9.1, 9.2, 9.3_
  - _Boundary: use-popper.ts_

---

- [x] 2. 组件实现：`AeroDatePicker` 核心行为
- [x] 2.1 单日期选择（date）
  - `type="date"`（默认）：受控值 `Date | string | number`，经 dayjs 归一；点击日期选中并收起，派发 `update:modelValue` + `change`
  - 触发器按 `format` 回显；空值展示占位
  - 完成态：点击日期后 `modelValue` 更新且面板收起、回显格式化
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.1, 8.2_

- [x] 2.2 日期范围选择（daterange）
  - `type="daterange"`：两段式选择（起始 → 结束），结束早于起始则重设为起始；确定范围派发 `update:modelValue` + `change` 并收起
  - `start-placeholder`/`end-placeholder` 分别作为起止占位
  - 完成态：范围态点击起止日期后 `modelValue` 更新为 `[start, end]` 并回显 `start - end`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2.3 日历面板（DateTable）
  - 6×7 日期网格（前后月补位）+ 年月导航（上/下月切换）；选中/禁用/范围内/起止日期标注
  - 外部点击/Escape 收起；`visible-change` 派发
  - 完成态：面板展示当月日历、可切换月份、外部点击/Escape 收起
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2.4 日期格式化与派发
  - `format` 控制回显、`value-format` 控制派发字符串（未设置派发 `Date`）
  - 完成态：`value-format="YYYY/MM/DD"` 时派发该格式字符串；未设置派发 `Date`
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 2.5 禁用日期、整体禁用、可清空、可编辑
  - `disabled-date` 函数禁用日期；`disabled` 整体禁用不可展开；`size` 三档；`clearable` 清空并派发 `clear`；`editable=false` 只读
  - 完成态：禁用日期不可选、整体禁用不可展开、清空入口可见、`editable=false` 输入框只读
  - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 8.3_

---

- [x] 3. 表单集成与样式
- [x] 3.1 (P) 表单上下文集成
  - `disabled` 显式默认 `undefined` 经 `useFormDisabled` 折叠；复用 `useFormSize`/`useFormDisabled` 解析尺寸/禁用（自身→表单项→表单→默认）
  - blur/change 触发 `formItemContext?.validate('blur' | 'change')`（fire-and-forget）
  - 完成态：位于 `disabled` 的 `AeroForm` 内自动禁用；表单外仅由自身 props 决定
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - _Boundary: DatePicker.vue（脚本层）_

- [x] 3.2 (P) 样式：BEM 类与语义 token
  - DOM 类名 BEM（`aero-date-picker`/`aero-date-picker__panel`/`aero-date-table` 与 `is-disabled`/`is-selected`/`is-range` 修饰符）
  - 只消费 `--aero-*` 语义 token，禁止硬编码视觉值；明暗主题自动生效
  - 完成态：触发器与日历面板视觉在明暗主题下正确呈现
  - _Requirements: 11.1, 11.2, 11.3, 11.4_
  - _Boundary: style/index.scss_

---

- [x] 4. 导出契约与聚合
- [x] 4.1 组件导出与 barrel 聚合
  - `index.ts` 导出带 `install` 的 `AeroDatePicker` 并 re-export 类型
  - 追加 `export * from './date-picker'` 到 `packages/components/index.ts`；`AeroDatePicker` 纳入 `packages/index.ts` 的 `AeroUI.install`
  - 完成态：`import { AeroDatePicker } from 'aero-ui'` 与 `app.use(AeroDatePicker)` 均可解析
  - _Requirements: 1.1, 1.3, 1.5_

---

- [x] 5. 测试与校验
- [x] 5.1 (P) `date.test.ts` 日期纯函数测试
  - 覆盖 `parse`/`format`/`buildMonth`/`isSameDay`/`isInRange`，含跨月/闰年边界
  - 完成态：日期纯函数断言通过
  - _Requirements: 5.1, 5.2, 5.3, 12.4_
  - _Boundary: date.test.ts_

- [x] 5.2 (P) `DatePicker.test.ts` 组件行为测试
  - 覆盖单日期/范围选择、面板交互、格式化、禁用、清空/可编辑、事件
  - 完成态：组件 props/行为/事件断言通过
  - _Requirements: 2.3, 3.2, 6.1, 8.1, 12.4_
  - _Boundary: DatePicker.test.ts_

- [x] 5.3 (P) 表单集成测试
  - 在 `AeroForm`/`AeroFormItem` 内验证 `size`/`disabled` 继承与 blur/change 触发字段校验
  - 完成态：表单上下文继承与校验触发断言通过
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 12.4_
  - _Boundary: DatePicker.test.ts（表单集成 describe）_
