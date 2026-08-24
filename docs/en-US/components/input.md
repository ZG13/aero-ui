# Input

Enter content by mouse or keyboard, with controlled value, disabled and clearable support.

## Basic usage

Bind the controlled value with `v-model`.

```vue
<template>
  <AeroInput v-model="value" placeholder="Please enter" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## Disabled

`disabled` makes the input non-editable.

```vue
<template>
  <AeroInput v-model="value" disabled />
</template>
```

## Clearable

`clearable` shows a clear entry when there is a value; clicking clears it and emits `clear`.

```vue
<template>
  <AeroInput v-model="value" clearable placeholder="Please enter" />
</template>
```

## Sizes

Control the size via `size`: `large`, `main`, or `small`.

```vue
<template>
  <AeroInput v-model="value" size="large" placeholder="Large" />
  <AeroInput v-model="value" size="main" placeholder="Main" />
  <AeroInput v-model="value" size="small" placeholder="Small" />
</template>
```

## API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| modelValue | Binding value | `string \| number` | — |
| placeholder | Placeholder text (falls back to locale default when omitted) | `string` | — |
| disabled | Whether the input is disabled | `boolean` | `false` |
| clearable | Whether the input is clearable | `boolean` | `false` |
| size | Input size | `'large' \| 'main' \| 'small'` | `'main'` |

### Events

| Name | Description | Arguments |
| ---- | ----------- | --------- |
| update:modelValue | Emitted when the value updates | `(value: string \| number)` |
| input | Emitted on input | `(value: string \| number)` |
| change | Emitted on blur when the value changed | `(value: string \| number)` |
| focus | Emitted when focused | `(event: FocusEvent)` |
| blur | Emitted when blurred | `(event: FocusEvent)` |
| clear | Emitted when the clear entry is clicked | — |
