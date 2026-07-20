# EpButton 组件开发提示词（基于 Figma Haldur Design System）

> 本提示词供 Claude Code 生成 `ep-craft` 组件库的 `Button` 组件，必须严格遵循 `init.md` 全局约定（包名 `ep-craft`、组件前缀 `Ep`、class 前缀 `ep-`、语义层 CSS 变量、`<script setup lang="ts">`、SCSS 主题）。

## 一、组件概述

- **组件名**：`EpButton`（标签 `<EpButton />`）。
- **class 根**：`.ep-button`（BEM）。
- **用途**：触发操作，支持多类型、多尺寸、多样式、图标、加载与禁用状态。
- **结构**：左侧图标 `icon_left` + 文本 `title` + 右侧图标 `icon_right`，水平排列、居中对齐、间距 `4px`。

## 二、Props 设计（来自 Figma 变体维度）

Figma 变体维度：`尺寸(size)`、`类型(type)`、`状态(state)`、`样式(style)`、`形状(shape)`、`无文字(icon-only)`。其中「状态」由交互与 `disabled`/`loading` 属性驱动，不作为 Props 显式暴露。

| Prop | 类型 | 可选值 | 默认值 | 说明（对应 Figma 维度） |
| --- | --- | --- | --- | --- |
| `type` | `EpButtonType` | `primary` \| `success` \| `danger` \| `warning` \| `info` | `primary` | 类型。Figma 的 `green` 映射为 `success` |
| `size` | `EpButtonSize` | `mini` \| `small` \| `middle` \| `large` | `middle` | 尺寸 |
| `variant` | `EpButtonVariant` | `solid` \| `plain` \| `none` | `solid` | 样式。`solid` 实心 / `plain` 描边 / `none` 无底文字 |
| `round` | `boolean` | — | `false` | 形状。`true` 时圆角取 `--ep-radius-full`（对应 Figma shape） |
| `disabled` | `boolean` | — | `false` | 禁用态，整体 `opacity: 0.4` 且不可点击 |
| `loading` | `boolean` | — | `false` | 加载态，左侧显示旋转图标并禁用点击 |
| `icon` | `string` | — | — | 左侧图标名（对应 `icon_left`） |
| `suffixIcon` | `string` | — | — | 右侧图标名（对应 `icon_right`） |

> 图标独占（icon-only）：当仅有 `icon`/`suffixIcon` 且无默认插槽内容时，自动进入 icon-only 布局（左右 padding 收敛为正方形）。

## 三、Emits 与 Slots

```ts
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
```

- `disabled` 或 `loading` 时不得触发 `click`。

| Slot | 说明 |
| --- | --- |
| `default` | 按钮文本内容（对应 `title`） |
| `icon` | 自定义左侧图标（优先级高于 `icon` prop） |

## 四、尺寸规格（Figma 实测值）

字体统一 `PingFang SC / 400`；圆角统一 `4px`（对应 `--ep-radius-main`）。

| size | padding (上下 左右) | gap | 字号 / 行高 | 图标尺寸 | 语义 token |
| --- | --- | --- | --- | --- | --- |
| `mini` | `3px 12px` | `4px` | `12px / 1.5` | `12` | `--ep-spacing-*` |
| `small` | `3px 12px` | `4px` | `14px / 1.571` | `14` | — |
| `middle` | `5px 16px` | `4px` | `14px / 1.571` | `14` | — |
| `large` | `7px 20px` | `4px` | `14px / 1.571` | `14` | — |

> 注：`mini` 使用 `BODY/small`（12px），其余尺寸使用 `BODY/main`（14px）。padding 请优先映射为语义间距变量，无匹配值时使用像素值兜底。

## 五、颜色规格与主题变量映射

Figma 原始色值均可映射到 `ep-craft` 主题语义层变量（禁止硬编码，禁止引用基础色板）。以 `primary` 为例（其余 `type` 同构，替换语义前缀即可）：

| type | 语义前缀 |
| --- | --- |
| `primary` | `--ep-primary-*` |
| `success` | `--ep-success-*`（Figma green） |
| `danger` | `--ep-danger-*` |
| `warning` | `--ep-warning-*` |
| `info` | `--ep-info-*` / 中性色 |

### 5.1 variant=solid（实心）

| 状态 | 背景 | 文字 | Figma 实测 (primary) |
| --- | --- | --- | --- |
| normal | `--ep-primary-6` | `--ep-text-white` | bg `#1C64FD` / text `#FFFFFF` |
| hover | `--ep-primary-5` | `--ep-text-white` | bg `#4480FF` |
| active | `--ep-primary-7` | `--ep-text-white` | bg `#164ED1` |
| disabled | 同 normal + `opacity: 0.4` | — | opacity `0.4` |

### 5.2 variant=plain（描边）

| 状态 | 背景 | 边框 | 文字 |
| --- | --- | --- | --- |
| normal | 透明 `rgba(255,255,255,0)` | `--ep-primary-6`（`1px`） | `--ep-primary-6` |
| hover | `--ep-primary-1`（浅底） | `--ep-primary-5` | `--ep-primary-5` |
| active | `--ep-primary-2` | `--ep-primary-7` | `--ep-primary-7` |
| disabled | 透明 + `opacity: 0.4` | — | — |

> Figma plain 实测：边框 `strokeWeight: 1px`、颜色 `#1C64FD`，背景透明，文字同边框色。

### 5.3 variant=none（无底）

| 状态 | 背景 | 文字 |
| --- | --- | --- |
| normal | 透明 | `--ep-primary-6` |
| hover | `--ep-feedback-hover` | `--ep-primary-5` |
| active | `--ep-feedback-active` | `--ep-primary-7` |
| disabled | 透明 + `opacity: 0.4` | — |

## 六、样式实现要求（SCSS）

- 组件样式写在 `packages/components/Button/style/index.css`（或 `.scss` 编译产出），采用 BEM：
  - 根：`.ep-button`
  - 类型 + 样式修饰：`.ep-button--primary`、`.ep-button--plain`、`.ep-button--solid`、`.ep-button--none`
  - 尺寸修饰：`.ep-button--mini` / `--small` / `--middle` / `--large`
  - 状态类：`.is-disabled`、`.is-loading`、`.is-round`、`.is-icon-only`
- 所有颜色/间距/圆角必须使用语义层 CSS 变量，随 `.ep-theme-light` / `.ep-theme-dark` 自动切换。
- hover/active 通过 `:hover` / `:active` 伪类实现；`disabled`/`loading` 时移除交互样式。
- 使用 `transition` 让背景、边框、颜色平滑过渡。

## 七、交付物清单

严格按 `init.md` 第 2.1 节与目录规范产出：

```text
packages/components/Button/
├── src/
│   └── Button.vue          # <script setup lang="ts">，Props 用 defineProps<ButtonProps>()
├── style/
│   └── index.css           # BEM 样式，引用语义层 CSS 变量
├── __tests__/
│   └── Button.test.ts      # 覆盖 type/size/variant 渲染、click、disabled/loading 不触发、slots
├── types.ts                # 导出 ButtonProps / EpButtonType / EpButtonSize / EpButtonVariant
└── index.ts                # 导出组件与类型，附加 install（支持 app.use）
```

## 八、类型定义参考（types.ts）

```ts
export type EpButtonType = 'primary' | 'success' | 'danger' | 'warning' | 'info';
export type EpButtonSize = 'mini' | 'small' | 'middle' | 'large';
export type EpButtonVariant = 'solid' | 'plain' | 'none';

export interface ButtonProps {
  /** 按钮类型 @default 'primary' */
  type?: EpButtonType;
  /** 按钮尺寸 @default 'middle' */
  size?: EpButtonSize;
  /** 视觉样式：实心/描边/无底 @default 'solid' */
  variant?: EpButtonVariant;
  /** 是否圆角（full radius） @default false */
  round?: boolean;
  /** 是否禁用 @default false */
  disabled?: boolean;
  /** 是否加载中 @default false */
  loading?: boolean;
  /** 左侧图标名 */
  icon?: string;
  /** 右侧图标名 */
  suffixIcon?: string;
}
```

## 九、验收标准

- [ ] 4 种尺寸 padding / 字号 / 图标尺寸与第四节实测值一致。
- [ ] `solid` / `plain` / `none` 三种样式在 normal/hover/active/disabled 下颜色与第五节映射一致。
- [ ] 5 种 `type` 均通过替换语义前缀正确取色，暗黑模式下自动切换无错乱。
- [ ] `disabled` / `loading` 时点击不触发 `click` 事件。
- [ ] 组件内无硬编码颜色/间距，全部引用 `--ep-*` 语义变量。
- [ ] 单元测试通过，关键分支覆盖率 ≥ 80%；`vue-tsc --noEmit` 零错误。
