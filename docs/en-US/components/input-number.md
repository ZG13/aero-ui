# InputNumber

Enter numeric values via the stepper buttons or keyboard, with step, range, precision, and strict-step controls.

## Basic usage

Bind the value with `v-model`; the right-side stepper buttons increase/decrease by `step` (default 1).

```vue
<template>
  <AeroInputNumber v-model="value" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(1)
</script>
```

## Step

`step` controls the increment of each click.

```vue
<template>
  <AeroInputNumber v-model="value" :step="5" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(0)
</script>
```

## Range

`min`/`max` constrain the value; the corresponding stepper button becomes disabled at the boundary.

```vue
<template>
  <AeroInputNumber v-model="value" :min="0" :max="100" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(50)
</script>
```

## Precision & strict step

`precision` controls decimal places; `step-strictly` aligns entered values to `step` multiples.

```vue
<template>
  <AeroInputNumber v-model="value" :precision="2" :step="0.1" />
  <AeroInputNumber v-model="value2" :step="5" step-strictly />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(1.5)
const value2 = ref(5)
</script>
```

## Disabled & readonly

`disabled` disables everything; `readonly` blocks keyboard input but allows the stepper.

```vue
<template>
  <AeroInputNumber v-model="value" disabled />
  <AeroInputNumber v-model="value2" readonly />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(1)
const value2 = ref(2)
</script>
```

## Hide stepper buttons

`controls` set to `false` hides the stepper buttons, leaving only the input.

```vue
<template>
  <AeroInputNumber v-model="value" :controls="false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(1)
</script>
```

## Form integration

Inside `AeroForm`/`AeroFormItem`, it inherits form/form-item-level `size`/`disabled` and triggers field validation on blur/change.

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="Count" prop="count">
      <AeroInputNumber v-model="form.count" :min="1" :max="99" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">Submit</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ count: 1 })

const rules = {
  count: [{ required: true, message: 'Please enter a count', trigger: 'change' }],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## InputNumber API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| modelValue | Binding value | `number` | — |
| step | Step increment | `number` | `1` |
| min | Minimum value | `number` | `-Infinity` |
| max | Maximum value | `number` | `Infinity` |
| precision | Decimal places (rounded) | `number` | — |
| stepStrictly | Whether entered values align to step multiples | `boolean` | `false` |
| controls | Whether to show stepper buttons | `boolean` | `true` |
| disabled | Whether disabled (inherits form-level when omitted) | `boolean` | `false` |
| size | Size (inherits form-level when omitted) | `'large' \| 'main' \| 'small'` | `'main'` |
| readonly | Whether readonly (blocks keyboard but allows stepper) | `boolean` | `false` |
| placeholder | Placeholder text | `string` | — |
| name | Native name attribute, passed to the inner input | `string` | — |

### Events

| Name | Description | Arguments |
| ---- | ----------- | --------- |
| update:modelValue | Emitted when the value changes | `(value: number \| undefined)` |
| change | Emitted when the value changes | same as above |
| focus | Emitted on focus | `(event: FocusEvent)` |
| blur | Emitted on blur | `(event: FocusEvent)` |
