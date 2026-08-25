# Button

Common action buttons.

## Basic usage

Use `type` to set the semantic variant.

```vue
<template>
  <AeroButton type="primary">Primary</AeroButton>
  <AeroButton type="success">Success</AeroButton>
  <AeroButton type="warning">Warning</AeroButton>
  <AeroButton type="danger">Danger</AeroButton>
  <AeroButton type="info">Info</AeroButton>
</template>
```

## Variants

`variant` supports `solid`, `plain`, and `none`.

```vue
<template>
  <AeroButton type="primary" variant="solid">Solid</AeroButton>
  <AeroButton type="primary" variant="plain">Plain</AeroButton>
  <AeroButton type="primary" variant="none">Text</AeroButton>
</template>
```

## Sizes

Control the size via `size`: `large` (36px), `default` (32px), `small` (28px), or `mini` (24px).

```vue
<template>
  <AeroButton size="large">Large</AeroButton>
  <AeroButton size="default">Default</AeroButton>
  <AeroButton size="small">Small</AeroButton>
  <AeroButton size="mini">Mini</AeroButton>
</template>
```

## Disabled and loading

`disabled` disables the button; `loading` shows a loading state. Both suppress `click`.

```vue
<template>
  <AeroButton disabled>Disabled</AeroButton>
  <AeroButton loading>Loading</AeroButton>
</template>
```

## Icon button

Pass an icon name via `icon` (rendered through `AeroIcon`); `iconPosition` controls its side (`left` / `right`).

```vue
<template>
  <AeroButton icon="search">Search</AeroButton>
  <AeroButton icon="search" iconPosition="right">Search</AeroButton>
  <AeroButton icon="search" />
</template>
```

## API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| type | Semantic variant | `'primary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` |
| variant | Button style | `'solid' \| 'plain' \| 'none'` | `'solid'` |
| size | Button size | `'large' \| 'default' \| 'small' \| 'mini'` | `'default'` |
| shape | Button shape | `'default' \| 'round'` | `'default'` |
| disabled | Whether the button is disabled | `boolean` | `false` |
| loading | Whether the button is loading | `boolean` | `false` |
| icon | Icon name (rendered via AeroIcon) | `string` | — |
| iconPosition | Icon position | `'left' \| 'right'` | `'left'` |
| nativeType | Native button type | `'button' \| 'submit' \| 'reset'` | `'button'` |

### Events

| Name | Description | Arguments |
| ---- | ----------- | --------- |
| click | Emitted on click (not when disabled / loading) | `(event: MouseEvent)` |
