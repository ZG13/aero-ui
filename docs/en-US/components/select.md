# Select

Use a dropdown menu to display and select content when there are too many options. `AeroSelect` carries the selection logic and panel; `AeroOption` declares options.

## Basic usage

Bind the selected value with `v-model`; `AeroOption`'s `label` is the display text and `value` is the selected value. The placeholder shows when empty.

```vue
<template>
  <AeroSelect v-model="value" placeholder="Please select a city">
    <AeroOption label="Beijing" value="beijing" />
    <AeroOption label="Shanghai" value="shanghai" />
    <AeroOption label="Guangzhou" value="guangzhou" />
    <AeroOption label="Shenzhen" value="shenzhen" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## Clearable

`clearable` shows a clear entry when there is a value; clicking clears it and emits `clear`.

```vue
<template>
  <AeroSelect v-model="value" clearable placeholder="Please select a city">
    <AeroOption label="Beijing" value="beijing" />
    <AeroOption label="Shanghai" value="shanghai" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('shanghai')
</script>
```

## Multiple

`multiple` enables multi-select with an array `model-value`; selected values render as tags, and a tag's close entry removes a single value.

```vue
<template>
  <AeroSelect v-model="value" multiple clearable placeholder="Please select cities">
    <AeroOption label="Beijing" value="beijing" />
    <AeroOption label="Shanghai" value="shanghai" />
    <AeroOption label="Guangzhou" value="guangzhou" />
    <AeroOption label="Shenzhen" value="shenzhen" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(['beijing', 'shanghai'])
</script>
```

## Filterable

`filterable` enables local search, filtering options by label (case-insensitive); shows an empty state when nothing matches.

```vue
<template>
  <AeroSelect v-model="value" filterable placeholder="Select or search a city">
    <AeroOption label="Beijing" value="beijing" />
    <AeroOption label="Shanghai" value="shanghai" />
    <AeroOption label="Guangzhou" value="guangzhou" />
    <AeroOption label="Shenzhen" value="shenzhen" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## Disabled

`disabled` disables the whole select; `AeroOption`'s `disabled` disables a single option.

```vue
<template>
  <AeroSelect v-model="value" placeholder="Please select a city">
    <AeroOption label="Beijing" value="beijing" />
    <AeroOption label="Shanghai" value="shanghai" disabled />
    <AeroOption label="Guangzhou" value="guangzhou" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## Form integration

When placed inside `AeroForm`/`AeroFormItem`, it inherits form/form-item-level `size`/`disabled` and triggers field validation on blur/change.

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="City" prop="city">
      <AeroSelect v-model="form.city" placeholder="Please select a city">
        <AeroOption label="Beijing" value="beijing" />
        <AeroOption label="Shanghai" value="shanghai" />
      </AeroSelect>
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">Submit</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ city: '' })

const rules = {
  city: [{ required: true, message: 'Please select a city', trigger: 'change' }],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## Select API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| modelValue | Binding value: `string \| number` for single, array for multiple | `string \| number \| (string \| number)[]` | — |
| multiple | Whether multiple selection is enabled | `boolean` | `false` |
| clearable | Whether the select is clearable | `boolean` | `false` |
| filterable | Whether local search is enabled | `boolean` | `false` |
| placeholder | Placeholder text (falls back to locale default when omitted) | `string` | — |
| disabled | Whether disabled (inherits form-level when omitted) | `boolean` | `false` |
| size | Size (inherits form-level when omitted) | `'large' \| 'main' \| 'small'` | `'main'` |

### Events

| Name | Description | Arguments |
| ---- | ----------- | --------- |
| update:modelValue | Emitted when the selected value changes | `(value: string \| number \| (string \| number)[] \| undefined)` |
| change | Emitted when the selected value changes | same as above |
| clear | Emitted when the clear entry is clicked | — |
| visible-change | Emitted when the panel opens/closes | `(visible: boolean)` |

## Option API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| label | Option label (used for display and search) | `string \| number` | — |
| value | Option value | `string \| number` | — |
| disabled | Whether the option is disabled | `boolean` | `false` |
