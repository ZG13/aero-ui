# Icon 图标

按图标名渲染内联 SVG，内置最小图标集。

## 基础用法

通过 `name` 指定图标。

```vue
<template>
  <AeroIcon name="search" />
  <AeroIcon name="close" />
  <AeroIcon name="loading" />
</template>
```

## 尺寸与颜色

`size` 控制尺寸（数字按 px，默认 `1em`），`color` 控制颜色（默认 `currentColor`）。

```vue
<template>
  <AeroIcon name="search" :size="24" />
  <AeroIcon name="search" size="2em" color="#3b82f6" />
</template>
```

## API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| name | 内置图标集的 key（`loading` / `close` / `search`） | `string` | — |
| size | 尺寸（数字按 px，默认 `1em` 继承字号） | `number \| string` | `'1em'` |
| color | 颜色 | `string` | `'currentColor'` |

> 未知 `name` 会渲染为空内容，不抛错。
