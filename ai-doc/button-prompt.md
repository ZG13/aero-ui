# AeroButton 组件生成 prompt 模板

> 公共约定（编码规则、禁用 API）见仓库根目录 `AI_CONTEXT.md`，本模板仅补充 Button 专属契约与用法。

## 目标

生成 `AeroButton` 组件：`index.ts`（导出带 `install` 的 `AeroButton` + 再导出类型）、`src/Button.vue`（`<script setup lang="ts">`）、`style/index.scss`、`types.ts`、`__tests__/Button.test.ts`。

## Props / Emits 契约

```ts
export type ButtonType = 'primary' | 'default' | 'danger' | 'link';
export type ButtonSize = 'large' | 'default' | 'small' | 'mini';
export type ButtonNativeType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  /** @default 'default' */
  type?: ButtonType;
  /** @default 'default' */
  size?: ButtonSize;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  loading?: boolean;
  /** 图标名，经 AeroIcon 渲染 */
  icon?: string;
  /** @default 'button' */
  nativeType?: ButtonNativeType;
}

export interface ButtonEmits {
  (e: 'click', event: MouseEvent): void;
}
```

约束：`disabled` 与 `loading` 均阻止 `click`；`loading` 时展示加载态并经 `AeroIcon` 渲染 `loading` 图标；`icon` 经 `AeroIcon` 渲染。

## --aero-* token 用法

- 主色按钮：`background: var(--aero-primary-6)`、`color: var(--aero-text-inverse)`。
- 危险按钮：`background: var(--aero-danger-6)`、`color: var(--aero-text-inverse)`。
- 链接按钮：透明底 + `color: var(--aero-primary-6)`。
- 默认按钮：`background: var(--aero-bg-main)`、`border: 1px solid var(--aero-border-main)`、`color: var(--aero-text-main)`。
- 尺寸/圆角/间距：`--aero-typography-size-*`、`--aero-radius-main`、`--aero-space-*`、`--aero-opacity-disabled`。

DOM 类名（BEM）：`aero-button`、`aero-button--{type}`、`aero-button--size-{size}`、`aero-button__loading`、`aero-button__icon`、状态修饰 `is-disabled` / `is-loading` / `is-icon-only`。

尺寸对应：`large`=36px、`default`=32px、`small`=28px、`mini`=24px。

## 代码生成规则指引

遵循 `AI_CONTEXT.md`「代码生成规则」（`<script setup>` + `defineProps<T>` + `defineEmits<T>`、`types.ts` 承载类型、BEM、只消费 `--aero-*`、一组件一文件夹）与「禁用 API 清单」（禁 `--ep-*`、`.dark`、Options API、硬编码、基础色板、`any`、外部图标库）。
