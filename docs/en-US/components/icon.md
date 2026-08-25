# Icon

Render an inline SVG by name from the built-in minimal icon set.

## Icon list

Click an icon to copy its name.

<IconGrid />

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

`size` controls the size (numbers in px, default `1em`); `color` controls the color (default `--aero-neutral-10`, i.e. `$coolgrey-10`).

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
| name | Key of the built-in icon set (`search` / `close` / `loading` / `settings` / `link`) | `string` | — |
| size | Size (numbers in px, default `1em` inherits font size) | `number \| string` | `'1em'` |
| color | Color | `string` | `'var(--aero-neutral-10)'` |

> Unknown `name` renders empty content without throwing.
