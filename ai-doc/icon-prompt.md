# AeroIcon 组件生成 prompt 模板

> 公共约定（编码规则、禁用 API）见仓库根目录 `AI_CONTEXT.md`，本模板仅补充 Icon 专属契约与用法。

## 目标

生成 `AeroIcon` 组件：`index.ts`（导出带 `install` 的 `AeroIcon` + 再导出类型）、`src/Icon.vue`（`<script setup lang="ts">`，内置图标集）、`style/index.scss`、`types.ts`、`__tests__/Icon.test.ts`。

## Props 契约

```ts
export interface IconProps {
  /** 内置图标集的 key，如 loading / close / search */
  name: string;
  /** 尺寸，数字按 px，默认 1em */
  size?: number | string;
  /** 颜色，默认 currentColor */
  color?: string;
}
```

约束：`name` 为内置最小图标集（`loading` / `close` / `search`）的 key，渲染对应内联 SVG；未知 `name` 渲染为空内容且不抛错；`size` 数字按 px、默认 `1em`；`color` 默认 `currentColor` 继承文本颜色。

## --aero-* token 用法

- 图标默认颜色 `currentColor`，尺寸继承字号，无需硬编码颜色/尺寸。
- 若需独立颜色：`color: var(--aero-text-main)` 等语义变量。
- DOM 类名（BEM）：`aero-icon`。

## 代码生成规则指引

遵循 `AI_CONTEXT.md`「代码生成规则」与「禁用 API 清单」；图标为内置内联 SVG（`viewBox 0 0 24 24`），禁止引入外部图标库。
