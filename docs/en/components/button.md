# Button

Common operation button.

## Basic Usage

Use `type` to define the button type.

<div class="ep-demo-block">
  <EpButton type="primary">Primary</EpButton>
  <EpButton type="success">Success</EpButton>
  <EpButton type="info">Info</EpButton>
  <EpButton type="warning">Warning</EpButton>
  <EpButton type="danger">Danger</EpButton>
</div>

```vue
<EpButton type="primary">Primary</EpButton>
<EpButton type="success">Success</EpButton>
```

## Variant

Use `variant` for `solid`, `plain` or `none`.

<div class="ep-demo-block">
  <EpButton type="primary" variant="solid">Solid</EpButton>
  <EpButton type="primary" variant="plain">Plain</EpButton>
  <EpButton type="primary" variant="none">None</EpButton>
</div>

```vue
<EpButton type="primary" variant="plain">Plain</EpButton>
```

## Size

Use `size` for `mini` / `small` / `middle` / `large`.

<div class="ep-demo-block">
  <EpButton type="primary" size="large">Large</EpButton>
  <EpButton type="primary" size="middle">Middle</EpButton>
  <EpButton type="primary" size="small">Small</EpButton>
  <EpButton type="primary" size="mini">Mini</EpButton>
</div>

```vue
<EpButton type="primary" size="large">Large</EpButton>
```

## Disabled & Loading

<div class="ep-demo-block">
  <EpButton type="primary" disabled>Disabled</EpButton>
  <EpButton type="primary" loading>Loading</EpButton>
</div>

```vue
<EpButton type="primary" disabled>Disabled</EpButton>
<EpButton type="primary" loading>Loading</EpButton>
```

## API

### Props

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| type | Button type | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'info'` | `'primary'` |
| size | Button size | `'mini' \| 'small' \| 'middle' \| 'large'` | `'middle'` |
| variant | Visual style | `'solid' \| 'plain' \| 'none'` | `'solid'` |
| round | Rounded button | `boolean` | `false` |
| disabled | Disabled state | `boolean` | `false` |
| loading | Loading state | `boolean` | `false` |
| icon | Prefix icon name | `string` | — |
| suffixIcon | Suffix icon name | `string` | — |
| nativeType | Native button type | `'button' \| 'submit' \| 'reset'` | `'button'` |

### Events

| Event | Description | Parameters |
| --- | --- | --- |
| click | Emitted on click (not fired when disabled/loading) | `(event: MouseEvent)` |

### Slots

| Name | Description |
| --- | --- |
| default | Button content |
