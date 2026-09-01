# DatePicker

Select a single date or a date range through a calendar panel, with formatting, disabled dates, and clearing.

## Single date

`type="date"` (default) selects a single date; bind the value with `v-model`.

```vue
<template>
  <AeroDatePicker v-model="value" placeholder="Select a date" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## Date range

`type="daterange"` selects a start/end range, bound as a `[start, end]` array.

```vue
<template>
  <AeroDatePicker v-model="value" type="daterange" start-placeholder="Start date" end-placeholder="End date" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref<[string, string] | undefined>()
</script>
```

## Formatting

`format` controls the trigger display; `value-format` controls the bound value string format (when omitted, a `Date` object is emitted).

```vue
<template>
  <AeroDatePicker v-model="value" format="YYYY-MM-DD" value-format="YYYY/MM/DD" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## Disabled dates

`disabled-date` disables dates for which the function returns `true`.

```vue
<template>
  <AeroDatePicker v-model="value" :disabled-date="disabledDate" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')

function disabledDate(date: Date) {
  return date.getTime() < Date.now()
}
</script>
```

## Clearable & readonly

`clearable` shows a clear entry when there is a value; `editable` set to `false` makes the input readonly.

```vue
<template>
  <AeroDatePicker v-model="value" clearable />
  <AeroDatePicker v-model="value2" :editable="false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('2024-01-15')
const value2 = ref('2024-01-15')
</script>
```

## Form integration

Inside `AeroForm`/`AeroFormItem`, it inherits form/form-item-level `size`/`disabled` and triggers field validation on blur/change.

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="Date" prop="date">
      <AeroDatePicker v-model="form.date" placeholder="Select a date" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">Submit</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ date: '' })

const rules = {
  date: [{ required: true, message: 'Please select a date', trigger: 'change' }],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## DatePicker API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| modelValue | Binding value (single `Date\|string\|number`, range `[start, end]`) | `Date \| string \| number \| [Date\|string\|number, Date\|string\|number]` | — |
| type | Type | `'date' \| 'daterange'` | `'date'` |
| format | Trigger display format | `string` | `'YYYY-MM-DD'` |
| valueFormat | Bound value string format (when omitted, emits `Date`) | `string` | — |
| placeholder | Placeholder (single date) | `string` | — |
| startPlaceholder | Range start placeholder | `string` | — |
| endPlaceholder | Range end placeholder | `string` | — |
| disabled | Whether disabled (inherits form-level when omitted) | `boolean` | `false` |
| size | Size (inherits form-level when omitted) | `'large' \| 'main' \| 'small'` | `'main'` |
| disabledDate | Disabled-date predicate | `(date: Date) => boolean` | — |
| clearable | Whether clearable | `boolean` | `false` |
| editable | Whether editable (false = readonly) | `boolean` | `true` |

### Events

| Name | Description | Arguments |
| ---- | ----------- | --------- |
| update:modelValue | Emitted when the date changes | `(value: Date \| string \| [Date, Date] \| [string, string] \| undefined)` |
| change | Emitted when the date changes | same as above |
| clear | Emitted when the clear entry is clicked | — |
| visible-change | Emitted when the panel opens/closes | `(visible: boolean)` |
