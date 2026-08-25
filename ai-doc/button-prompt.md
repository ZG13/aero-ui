# AeroButton 组件生成 prompt 模板

> 公共约定（编码规则、禁用 API）见仓库根目录 `AI_CONTEXT.md`，本模板仅补充 Button 专属契约与用法。

## 目标

生成 `AeroButton` 组件：`index.ts`（导出带 `install` 的 `AeroButton` + 再导出类型）、`src/Button.vue`（`<script setup lang="ts">`）、`style/index.scss`、`types.ts`、`__tests__/Button.test.ts`。

## Props / Emits 契约

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

约束：`disabled` 与 `loading` 均阻止 `click`；`loading` 时展示加载态并经 `AeroIcon` 渲染 `loading` 图标；`icon` 经 `AeroIcon` 渲染，`iconPosition` 决定图标位于文字左侧或右侧。

## 视觉矩阵（类型 × 样式 × 状态）

### solid（实底，文字 `--aero-text-inverse`，info 例外用 `--aero-neutral-10`）

| type | normal | hover | active |
|------|--------|-------|--------|
| primary | `--aero-primary-6` | `--aero-primary-5` | `--aero-primary-7` |
| success | `--aero-success-6` | `--aero-success-5` | `--aero-success-7` |
| warning | `--aero-warning-6` | `--aero-warning-5` | `--aero-warning-7` |
| danger | `--aero-danger-6` | `--aero-danger-5` | `--aero-danger-7` |
| info | `--aero-neutral-2` | `--aero-neutral-3` | `--aero-neutral-4` |

### plain（描边，1px 主色描边，透明底）

| type | normal 文字/描边 | hover 背景 | active 背景 |
|------|-----------------|-----------|------------|
| primary | `--aero-primary-6` | `--aero-primary-1` | `--aero-primary-2` |
| success | `--aero-success-6` | `--aero-success-1` | `--aero-success-2` |
| warning | `--aero-warning-6` | `--aero-warning-1` | `--aero-warning-2` |
| danger | `--aero-danger-6` | `--aero-danger-1` | `--aero-danger-3` |
| info | 文字 `--aero-neutral-10` / 描边 `--aero-neutral-3` | `--aero-neutral-1` | `--aero-neutral-2` |

### none（纯文本，无边框无背景）

文字色同 plain（`--aero-{type}-6`，info 用 `--aero-neutral-10`）；`hover` 背景 `--aero-fill-hover`、`active` 背景 `--aero-fill-active`。

## 尺寸

| size | 高度 | 水平 padding | 字号 |
|------|------|-------------|------|
| large | 36px | `--aero-space-20` | `--aero-typography-size-02` |
| default | 32px | `--aero-space-16` | `--aero-typography-size-02` |
| small | 28px | `--aero-space-12` | `--aero-typography-size-02` |
| mini | 24px | `--aero-space-12` | `--aero-typography-size-01` |

圆角 `--aero-radius-main`（`round` 形状用 `--aero-radius-full`）；图标与文字 gap `--aero-space-4`；禁用 `--aero-opacity-disabled`。

DOM 类名（BEM）：`aero-button`、`aero-button--{type}`、`aero-button--{variant}`、`aero-button--size-{size}`、`aero-button--{shape}`、`aero-button__loading`、`aero-button__icon`、状态修饰 `is-disabled` / `is-loading` / `is-icon-only`。

## 代码生成规则指引

遵循 `AI_CONTEXT.md`「代码生成规则」（`<script setup>` + `defineProps<T>` + `defineEmits<T>`、`types.ts` 承载类型、BEM、只消费 `--aero-*`、一组件一文件夹）与「禁用 API 清单」（禁 `--ep-*`、`.dark`、Options API、硬编码、基础色板、`any`、外部图标库）。
