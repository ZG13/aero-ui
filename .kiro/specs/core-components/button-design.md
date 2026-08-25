# AeroButton 属性设计（基于 Haldur Design System）

> 依据 Figma《Web端设计规范 Haldur-Design-System》Button 组件集（`411:13430`）解析：
> - 样式/状态矩阵节点：`688:65879`
> - 尺寸轴节点：`684:37672`
>
> 本文档定义 Button 的 props 契约与视觉规格。**待确认后落地代码与双语文档。**

## 1. 背景与目标

现有 `AeroButton` 的 props 为 `type`（primary/default/danger/link）+ `size`，仅覆盖单一「样式」维度，无法表达 Figma 的「类型（语义色）× 样式（solid/plain/none）× 状态」三维组合。

本次目标：将 props 契约对齐 Haldur 设计系统，同时保持 `--aero-*` 语义 token 消费约束（组件不硬编码色值、不直接引用基础色板）。

## 2. Figma 变体维度解析

| 维度 | Figma 取值 | 说明 |
|------|-----------|------|
| 尺寸 | large / middle / small / mini | 高度 36 / 32 / 28 / 24px |
| 类型 | primary / info / green / danger / warning | 语义色 |
| 样式 | solid / plain / none | 实底 / 描边 / 纯文本 |
| 状态 | normal / hover / active / disable | hover/active 为 CSS 态，disable 由 props 驱动 |
| 形状 | default | 圆角 4px |
| 无文字 | no / yes | yes = 图标按钮（方形） |
| 图标 | 左侧icon / 右侧icon（布尔） | 图标尺寸 = 字号（14 / 12px），gap 4px |

**命名映射**：`green → success`（语义化，✅ 已确认）；`middle → default`（用户指定 32px 档命名为 `default`）；`info → 中性`。

## 3. Props 契约

```ts
export type ButtonType = 'primary' | 'info' | 'success' | 'warning' | 'danger';
export type ButtonVariant = 'solid' | 'plain' | 'none';
export type ButtonSize = 'large' | 'default' | 'small' | 'mini';
export type ButtonShape = 'default' | 'round';
export type ButtonIconPosition = 'left' | 'right';
export type ButtonNativeType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  /** @default 'info' */
  type?: ButtonType;
  /** @default 'solid' */
  variant?: ButtonVariant;
  /** @default 'default' */
  size?: ButtonSize;
  /** @default 'default' */
  shape?: ButtonShape;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  loading?: boolean;
  /** 图标名，经 AeroIcon 渲染 */
  icon?: string;
  /** @default 'left' */
  iconPosition?: ButtonIconPosition;
  /** @default 'button' */
  nativeType?: ButtonNativeType;
}

export interface ButtonEmits {
  (e: 'click', event: MouseEvent): void;
}
```

### 3.1 变更点（相对现状）

| 现状 | 设计 | 说明 |
|------|------|------|
| `type: 'default'` | `type: 'info'` | 中性语义统一为 info |
| `type: 'link'` | `variant: 'none'` | 文字按钮归入样式维度 |
| 无 `variant` | 新增 `variant: solid/plain/none` | 补全样式轴 |
| 无 `success`/`warning` | 新增 | 对齐 `--aero-success-*` / `--aero-warning-*` |
| 无 `shape` | 新增 `shape: default/round` | Figma 仅 default（4px），round 预留 |
| `icon`（仅左） | 新增 `iconPosition` | 对齐 Figma 左右图标 |
| 默认值 | `type='info'` + `variant='solid'` | ✅ 已认可 |

> **破坏性变更**：`type="default"`、`type="link"` 不再兼容，需迁移：
> - `type="default"` → `type="info"`（默认 solid，实底中性按钮）
> - `type="link"` → `type="primary" variant="none"`（文字按钮）

## 4. 尺寸规格（Figma `684:37672` 精确值）

| size | 高度 | 水平 padding | 字号 | 图标 | token（padding / 字号） |
|------|------|-------------|------|------|------------------------|
| large | 36px | 20px | 14px | 14px | `--aero-space-20` / `--aero-typography-size-02` |
| default | 32px | 16px | 14px | 14px | `--aero-space-16` / `--aero-typography-size-02` |
| small | 28px | 12px | 14px | 14px | `--aero-space-12` / `--aero-typography-size-02` |
| mini | 24px | 12px | 12px | 12px | `--aero-space-12` / `--aero-typography-size-01` |

- 圆角：`--aero-radius-main`（4px）
- 图标与文字 gap：`--aero-space-4`（4px）
- 图标尺寸 = 字号（继承 `font-size: inherit`，与 Figma 14/12px 一致）
- 图标按钮（无文字）：方形，`width = height`（36 / 32 / 28 / 24px），padding 0
- 禁用：`--aero-opacity-disabled`（0.4，与 Figma disable opacity 一致）

> **实现说明**：Figma 用 auto-layout 的垂直 padding 推导高度（large 7px、default 5px、small/mini 3px），组件实现改用固定 `height` + 水平 `padding`，文字垂直居中，无需引入非尺度的垂直 padding token。

## 5. 视觉矩阵（类型 × 样式 × 状态）

> 色值已映射到 `--aero-*` 语义 token。`disable` 统一为整键 `opacity: var(--aero-opacity-disabled)`，不再单独定义色值。

### 5.1 solid（实底）

| 类型 | normal 背景 | hover 背景 | active 背景 | 文字 |
|------|------------|-----------|------------|------|
| primary | `--aero-primary-6` | `--aero-primary-5` | `--aero-primary-7` | `--aero-text-inverse` |
| success | `--aero-success-6` | `--aero-success-5` | `--aero-success-7` | `--aero-text-inverse` |
| warning | `--aero-warning-6` | `--aero-warning-5` | `--aero-warning-7` | `--aero-text-inverse` |
| danger | `--aero-danger-6` | `--aero-danger-5` | `--aero-danger-7` | `--aero-text-inverse` |
| info | `--aero-neutral-2` | `--aero-neutral-3` | `--aero-neutral-4` | `--aero-neutral-10` |

### 5.2 plain（描边，1px）

| 类型 | normal 文字/描边 | normal 背景 | hover 背景 | active 背景 |
|------|-----------------|------------|-----------|------------|
| primary | `--aero-primary-6` | transparent | `--aero-primary-1` | `--aero-primary-2` |
| success | `--aero-success-6` | transparent | `--aero-success-1` | `--aero-success-2` |
| warning | `--aero-warning-6` | transparent | `--aero-warning-1` | `--aero-warning-2` |
| danger | `--aero-danger-6` | transparent | `--aero-danger-1` | `--aero-danger-3` |
| info | 文字 `--aero-neutral-10` / 描边 `--aero-neutral-3` | `--aero-bg-main` | `--aero-neutral-1` | `--aero-neutral-2` |

### 5.3 none（纯文本）

| 类型 | normal 文字 | hover 背景 | active 背景 |
|------|------------|-----------|------------|
| primary | `--aero-primary-6` | `--aero-fill-hover` | `--aero-fill-active` |
| success | `--aero-success-6` | `--aero-fill-hover` | `--aero-fill-active` |
| warning | `--aero-warning-6` | `--aero-fill-hover` | `--aero-fill-active` |
| danger | `--aero-danger-6` | `--aero-fill-hover` | `--aero-fill-active` |
| info | `--aero-neutral-10` | `--aero-fill-hover` | `--aero-fill-active` |

## 6. 新增语义 token（theme 层，✅ 已确认）

### 6.1 中性色阶 `--aero-neutral-1..10`

承载 info（中性）按钮的背景/描边/文字，对应基础色板 `coolgrey`。light 精确值：

| token | light 值 | 来源 |
|-------|---------|------|
| `--aero-neutral-1` | `#F7F8FA` | `$coolgrey-1` |
| `--aero-neutral-2` | `#F2F3F5` | `$coolgrey-2` |
| `--aero-neutral-3` | `#E5E6EB` | `$coolgrey-3` |
| `--aero-neutral-4` | `#C9CBD4` | `$coolgrey-4` |
| `--aero-neutral-5` | `#A9ACB8` | `$coolgrey-5` |
| `--aero-neutral-6` | `#868A9C` | `$coolgrey-6` |
| `--aero-neutral-7` | `#6B7085` | `$coolgrey-7` |
| `--aero-neutral-8` | `#4E5369` | `$coolgrey-8` |
| `--aero-neutral-9` | `#272B3B` | `$coolgrey-9` |
| `--aero-neutral-10` | `#1D1F29` | `$coolgrey-10` |

**dark 映射（中性反转，推导）**：`--aero-neutral-N` = `$coolgrey-(11-N)`（如 `-1`→`#1D1F29`、`-10`→`#F7F8FA`）。dark 精确值待 Figma 暗色节点二次确认。

### 6.2 叠加填充 `--aero-fill-hover` / `--aero-fill-active`

承载 none（纯文本）态悬停/按下背景：

| token | light 值 | dark 值 | 来源 |
|-------|---------|---------|------|
| `--aero-fill-hover` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.04)` | `$opacblack-2_04` / `$opacwhite-2_04` |
| `--aero-fill-active` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | `$opacblack-3_08` / `$opacwhite-3_08` |

## 7. DOM 类名（BEM）

```
aero-button
aero-button--{type}            # primary / info / success / warning / danger
aero-button--{variant}         # solid / plain / none
aero-button--size-{size}       # large / default / small / mini
aero-button--{shape}           # default / round
aero-button__icon
aero-button__loading
is-disabled / is-loading / is-icon-only
```

## 8. 决策记录

| # | 待决项 | 结论 |
|---|--------|------|
| 1 | 中性填充 token 缺口 | ✅ 新增 `--aero-neutral-1..10`（coolgrey 色阶） |
| 2 | none 态悬停背景 token | ✅ 新增 `--aero-fill-hover` / `--aero-fill-active` |
| 3 | 默认值 | ✅ `type='info'` + `variant='solid'` |
| 4 | green 命名 | ✅ 映射为 `success` |
| 5 | 尺寸 padding/字号 | ✅ 采用 `684:37672` 精确值（见 §4） |

## 9. 落地范围（待通知后执行）

- `packages/theme/base/color.scss`（新增 `$neutral-*` 语义映射，或将 coolgrey 映射加入 light/dark.scss）
- `packages/theme/light.scss` / `dark.scss`（新增 `--aero-neutral-*`、`--aero-fill-hover/active`）
- `packages/components/button/types.ts` / `src/Button.vue` / `style/index.scss` / `__tests__/Button.test.ts`
- `docs/zh-CN/components/button.md` / `docs/en-US/components/button.md`（双语同步）
- `AI_CONTEXT.md` / `ai-doc/button-prompt.md`（组件清单与生成模板同步）
