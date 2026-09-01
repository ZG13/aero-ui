# Implementation Plan

## Task Format

任务按「基础 → 核心 → 集成 → 校验」顺序排列；顺序本身即隐式依赖。组件子任务（2.x）均编辑同一组件文件 `InputNumber.vue`，故保持顺序执行（不标 `(P)`）；3.x 与 5.x 触及不同文件，标注 `(P)` 可并行。

---

- [x] 1. Foundation：类型契约与数值纯函数
- [x] 1.1 定义 `InputNumberProps`/`InputNumberEmits`/`InputNumberSize` 公开类型契约
  - 类型含全部 props（`modelValue`/`step`/`min`/`max`/`precision`/`stepStrictly`/`controls`/`disabled`/`size`/`readonly`/`placeholder`/`name`）与事件（`update:modelValue`/`change`/`focus`/`blur`）
  - JSDoc `@default` 齐全（`step=1`、`min=-Infinity`、`max=Infinity`、`controls=true`、`stepStrictly=false`、`readonly=false`、`size='main'`），严格 `no-any`
  - `types.ts` 导出后 `index.ts` 可 re-export，消费者可依赖
  - _Requirements: 1.2, 11.2, 11.3_

- [x] 1.2 实现数值计算纯函数模块 `src/number.ts`
  - 提供 `clamp(value, min, max)`、`toPrecision(value, precision?)`、`alignStep(value, step)`、`increase(value?, step, min, max, precision?)`、`decrease(...)` 五个纯函数
  - 无副作用、无 Vue 依赖；`increase`/`decrease` 空值以 `min`（若 `min > -Infinity`）否则 `0` 为起点
  - 统一「先 clamp 后 toPrecision」顺序，返回值恒落在 `[min, max]` 且精度正确
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.4_
  - _Boundary: number.ts_

---

- [x] 2. 组件实现：`AeroInputNumber` 核心行为
- [x] 2.1 基础数值绑定与输入态分离
  - 受控值 `modelValue`（`number`）同步到输入框；空值展示空输入框
  - 内部维护 `displayValue` 字符串承载输入态，失焦/Enter 时解析提交；非法（`NaN`/空）回退显示 `modelValue`
  - 非数值字符不录入；数值变化派发 `update:modelValue` + `change`，聚焦/失焦派发 `focus`/`blur`
  - 使用 `<script setup lang="ts">` + `defineProps<T>()`/`defineEmits<T>()`，禁用 Options API
  - 完成态：输入 `12.3` 失焦后 `modelValue` 更新为 12.3；输入非法文本失焦后输入框回退为原值
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.1, 8.2, 8.3, 11.1_

- [x] 2.2 步进按钮与步长
  - 渲染右侧上下两个步进按钮，点击按 `step`（默认 1）增减当前值
  - 空值时以 `min`（或 0）为起点步进；`controls=false` 时不渲染步进按钮
  - 步进立即提交并派发 `update:modelValue` + `change`
  - 完成态：点击增加按钮当前值 `+step`，点击减少 `-step`；`controls=false` 时无步进按钮
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2.3 边界约束
  - 步进或输入后的值经 `min`/`max` clamp；值到达边界时对应方向步进按钮进入不可用态
  - `min`/`max` 默认 `-Infinity`/`Infinity`（不限制）
  - 完成态：值为 `max` 时增加按钮禁用；值为 `min` 时减少按钮禁用；越界输入被修正到边界
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 2.4 精度与严格步进
  - `precision` 设置时对步进/输入后的值四舍五入到指定小数位
  - `stepStrictly=true` 时用户输入值对齐到最近 `step` 倍数
  - 完成态：`precision=2` 时输入 `1.234` 提交为 `1.23`；`stepStrictly` 下输入 `7`（step=5）对齐为 `5`
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 2.5 禁用、尺寸、只读、占位与 name 透传
  - `disabled` 不可输入且步进按钮不可用；`readonly` 禁键盘输入但允许步进
  - `size` 支持 `large`/`main`/`small`；空态展示 `placeholder`；`name` 透传到内部原生输入元素
  - 完成态：`disabled` 时输入框与按钮均不可用；`readonly` 时输入框只读但步进可用；`name` 出现在内部 input 元素上
  - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2_

---

- [x] 3. 表单集成与样式
- [x] 3.1 (P) 表单上下文集成
  - `disabled` 显式默认 `undefined` 绕过布尔 prop 强转，经 `useFormDisabled` 折叠
  - 复用 `useFormSize(props.size)` / `useFormDisabled(props.disabled)` 解析尺寸与禁用（自身→表单项→表单→默认）
  - blur/change 时调用 `formItemContext?.validate('blur' | 'change')`（fire-and-forget，不 await）
  - 表单上下文缺失时安全降级为独立控件，不报错
  - 完成态：位于 `disabled` 的 `AeroForm` 内自动禁用；位于表单外仅由自身 props 决定
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - _Boundary: InputNumber.vue（脚本层）_

- [x] 3.2 (P) 样式：BEM 类与语义 token
  - DOM 类名 BEM（`aero-input-number`/`aero-input-number__increase`/`aero-input-number__decrease`/`is-disabled`/`is-readonly`）
  - 只消费 `--aero-*` 语义 token，禁止硬编码颜色/间距/圆角与直接引用基础色板；步进三角用 CSS 绘制
  - 明暗主题随根类 `.aero-theme-light`/`.aero-theme-dark` 自动生效
  - 完成态：输入框与步进按钮视觉在明暗主题下正确呈现，无硬编码视觉值
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - _Boundary: style/index.scss_

---

- [x] 4. 导出契约与聚合
- [x] 4.1 组件导出与 barrel 聚合
  - `index.ts` 导出带 `install` 的 `AeroInputNumber` 并 re-export 类型
  - 追加 `export * from './input-number'` 到 `packages/components/index.ts`；`AeroInputNumber` 纳入 `packages/index.ts` 的 `AeroUI.install`
  - 完成态：`import { AeroInputNumber } from 'aero-ui'` 与 `app.use(AeroInputNumber)` 均可解析
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

---

- [x] 5. 测试与校验
- [x] 5.1 (P) `number.test.ts` 纯函数测试
  - 覆盖 `clamp` 边界、`toPrecision` 精度、`alignStep` 对齐、`increase`/`decrease` 步进与空值起点
  - 覆盖「先 clamp 后 toPrecision」组合（如 `precision` + `min`/`max` 同时作用）
  - 完成态：全部纯函数边界与精度断言通过
  - _Requirements: 4.2, 4.3, 5.2, 5.4, 11.4_
  - _Boundary: number.test.ts_

- [x] 5.2 (P) `InputNumber.test.ts` 组件行为测试
  - 覆盖受控值同步、空态、非法字符拦截、步进、边界禁用、精度、严格步进、禁用/只读、事件（`update:modelValue`/`change`/`focus`/`blur`）
  - 完成态：组件 props/行为/事件断言通过
  - _Requirements: 2.2, 3.2, 6.1, 8.1, 11.4_
  - _Boundary: InputNumber.test.ts_

- [x] 5.3 (P) 表单集成测试
  - 在 `AeroForm`/`AeroFormItem` 内验证 `size`/`disabled` 继承（自身→表单项→表单优先级）与 blur/change 触发字段校验
  - 完成态：表单上下文继承与校验触发断言通过
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 11.4_
  - _Boundary: InputNumber.test.ts（表单集成 describe）_
