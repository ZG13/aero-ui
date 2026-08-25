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
  <AeroButton type="success" variant="solid">Solid</AeroButton>
  <AeroButton type="warning" variant="solid">Solid</AeroButton>
  <AeroButton type="danger" variant="solid">Solid</AeroButton>
  <AeroButton type="info" variant="solid">Solid</AeroButton>
  <AeroButton type="primary" variant="plain">Plain</AeroButton>
  <AeroButton type="success" variant="plain">Plain</AeroButton>
  <AeroButton type="warning" variant="plain">Plain</AeroButton>
  <AeroButton type="danger" variant="plain">Plain</AeroButton>
  <AeroButton type="info" variant="plain">Plain</AeroButton>
  <AeroButton type="primary" variant="none">Text</AeroButton>
  <AeroButton type="success" variant="none">Text</AeroButton>
  <AeroButton type="warning" variant="none">Text</AeroButton>
  <AeroButton type="danger" variant="none">Text</AeroButton>
  <AeroButton type="info" variant="none">Text</AeroButton>
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

## Disabled

`disabled` disables the button; both `disabled` and `loading` suppress `click`.

```vue
<template>
  <AeroButton type="primary" disabled>Disabled</AeroButton>
  <AeroButton type="success" disabled>Disabled</AeroButton>
  <AeroButton type="warning" disabled>Disabled</AeroButton>
  <AeroButton type="danger" disabled>Disabled</AeroButton>
  <AeroButton type="info" disabled>Disabled</AeroButton>
  <AeroButton type="primary" variant="plain" disabled>Disabled</AeroButton>
  <AeroButton type="success" variant="plain" disabled>Disabled</AeroButton>
  <AeroButton type="warning" variant="plain" disabled>Disabled</AeroButton>
  <AeroButton type="danger" variant="plain" disabled>Disabled</AeroButton>
  <AeroButton type="info" variant="plain" disabled>Disabled</AeroButton>
  <AeroButton type="primary" variant="none" disabled>Disabled</AeroButton>
  <AeroButton type="success" variant="none" disabled>Disabled</AeroButton>
  <AeroButton type="warning" variant="none" disabled>Disabled</AeroButton>
  <AeroButton type="danger" variant="none" disabled>Disabled</AeroButton>
  <AeroButton type="info" variant="none" disabled>Disabled</AeroButton>
</template>
```

## Loading

`loading` shows a loading state; both `disabled` and `loading` suppress `click`.

```vue
<template>
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
