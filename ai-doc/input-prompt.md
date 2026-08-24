# AeroInput 组件生成 prompt 模板

> 公共约定（编码规则、禁用 API）见仓库根目录 `AI_CONTEXT.md`，本模板仅补充 Input 专属契约与用法。

## 目标

生成 `AeroInput` 组件：`index.ts`（导出带 `install` 的 `AeroInput` + 再导出类型）、`src/Input.vue`（`<script setup lang="ts">`）、`style/index.scss`、`types.ts`、`__tests__/Input.test.ts`。

## Props / Emits 契约

```ts
export type InputSize = 'large' | 'main' | 'small';

export interface InputProps {
  modelValue?: string | number;
  placeholder?: string;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  clearable?: boolean;
  /** @default 'main' */
  size?: InputSize;
}

export interface InputEmits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'input', value: string | number): void;
  (e: 'change', value: string | number): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'clear'): void;
}
```

约束：受控值经 `update:modelValue` 同步；输入派发 `input`；**失焦**派发 `change`（非原生 `@change`）；`disabled` 不可编辑；`clearable` 且有值时经 `AeroIcon`（`close`）渲染清空入口，点击清空并派发 `clear` 与 `update:modelValue`。

## --aero-* token 用法

- 容器：`border: 1px solid var(--aero-border-main)`、`background: var(--aero-bg-main)`、`border-radius: var(--aero-radius-main)`。
- 聚焦：`border-color: var(--aero-primary-6)`。
- 文本：`color: var(--aero-text-main)`；占位符 `color: var(--aero-text-disabled)`。
- 清空图标：`color: var(--aero-text-tertiary)`，hover `var(--aero-text-main)`。
- 禁用：`opacity: var(--aero-opacity-disabled)`。

DOM 类名（BEM）：`aero-input`、`aero-input--{size}`、`aero-input__inner`、`aero-input__clear`、状态修饰 `is-disabled`。

## 代码生成规则指引

遵循 `AI_CONTEXT.md`「代码生成规则」与「禁用 API 清单」；默认占位符经 `useLocale` 读取 `components.input.placeholder`。
