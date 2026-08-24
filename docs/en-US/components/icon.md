# Icon

Render an inline SVG by name from the built-in minimal icon set.

## Basic usage

Specify the icon via `name`.

```vue
<template>
  <AeroIcon name="search" />
  <AeroIcon name="close" />
  <AeroIcon name="loading" />
</template>
```

## Size and color

`size` controls the size (numbers in px, default `1em`); `color` controls the color (default `currentColor`).

```vue
<template>
  <AeroIcon name="search" :size="24" />
  <AeroIcon name="search" size="2em" color="#3b82f6" />
</template>
```

## API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| name | Key of the built-in icon set (`loading` / `close` / `search`) | `string` | — |
| size | Size (numbers in px, default `1em` inherits font size) | `number \| string` | `'1em'` |
| color | Color | `string` | `'currentColor'` |

> Unknown `name` renders empty content without throwing.
