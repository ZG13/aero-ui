# Button

Common action buttons.

## Basic usage

Use `type` and `size` to set the button variant and size.

```vue
<template>
  <AeroButton type="primary">Primary</AeroButton>
  <AeroButton>Default</AeroButton>
  <AeroButton type="danger">Danger</AeroButton>
  <AeroButton type="link">Link</AeroButton>
</template>
```

## Sizes

Control the size via `size`: `large`, `main`, or `small`.

```vue
<template>
  <AeroButton size="large">Large</AeroButton>
  <AeroButton size="main">Main</AeroButton>
  <AeroButton size="small">Small</AeroButton>
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

Pass an icon name via `icon`; it renders through `AeroIcon`.

```vue
<template>
  <AeroButton icon="search">Search</AeroButton>
  <AeroButton icon="search" />
</template>
```

## API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| type | Button variant | `'primary' \| 'default' \| 'danger' \| 'link'` | `'default'` |
| size | Button size | `'large' \| 'main' \| 'small'` | `'main'` |
| disabled | Whether the button is disabled | `boolean` | `false` |
| loading | Whether the button is loading | `boolean` | `false` |
| icon | Icon name (rendered via AeroIcon) | `string` | — |
| nativeType | Native button type | `'button' \| 'submit' \| 'reset'` | `'button'` |

### Events

| Name | Description | Arguments |
| ---- | ----------- | --------- |
| click | Emitted on click (not when disabled / loading) | `(event: MouseEvent)` |
