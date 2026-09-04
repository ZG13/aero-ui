# DatePicker

Select a single date or a date range through a calendar panel. Interactions align with element-plus: year/month view switching, selectable adjacent-month cells, range hover preview, manual input, shortcuts, and keyboard navigation.

## Single date

`type="date"` (default) selects a single date; bind the value with `v-model`. Click the year/month label in the panel header to switch to year / month view.

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

`type="daterange"` selects a start/end range with two side-by-side calendars, bound as a `[start, end]` array. After picking the start date, moving the mouse previews the range in real time; click again to finish.

```vue
<template>
  <AeroDatePicker v-model="value" type="daterange" start-placeholder="Start date" end-placeholder="End date" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref<[string, string] | undefined>()
</script>
```

### Range panel navigation

By default both calendars navigate together (always adjacent); `unlink-panels` makes them independent. `range-separator` customizes the trigger separator.

```vue
<template>
  <AeroDatePicker v-model="value" type="daterange" unlink-panels range-separator="to" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref<[string, string] | undefined>()
</script>
```

## Formatting

`format` controls the trigger display format; `value-format` controls the bound string format (a `Date` object is emitted when unset).

```vue
<template>
  <AeroDatePicker v-model="value" format="YYYY-MM-DD" value-format="YYYY/MM/DD" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## Manual input

With `editable` (default `true`), you can type a date directly and press `Enter` or blur to commit; invalid input restores the previous display. `readonly` keeps the input read-only while the panel still opens.

```vue
<template>
  <AeroDatePicker v-model="value" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## Shortcuts

Configure `shortcuts` to show quick options on the left side of the panel; `value` returns the selection (an array for range type).

```vue
<template>
  <AeroDatePicker v-model="value" type="daterange" :shortcuts="shortcuts" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref<[string, string] | undefined>()

const shortcuts = [
  { text: 'Last week', value: (dayjs) => { const end = dayjs(); return [end.subtract(7, 'day').toDate(), end.toDate()] } },
  { text: 'Last month', value: (dayjs) => { const end = dayjs(); return [end.subtract(1, 'month').toDate(), end.toDate()] } },
]
</script>
```

## Disabled dates

Dates for which `disabled-date` returns `true` are disabled in the panel.

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

## Clearable and default value

`clearable` shows a clear icon when hovering or focused with a value; clearing emits `null`. `default-value` sets the month the panel opens on.

```vue
<template>
  <AeroDatePicker v-model="value" clearable default-value="2024-01-01" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('2024-01-15')
</script>
```

## First day of week

`first-day-of-week` sets the week start day (0=Sunday … 6=Saturday, default 7 which is Sunday).

```vue
<template>
  <AeroDatePicker v-model="value" :first-day-of-week="1" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## Form integration

Inside `AeroForm`/`AeroFormItem`, the picker inherits form-level `size`/`disabled` and validates on blur/change (`validate-event: false` disables this).

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
  date: [{ required: true, message: 'Please pick a date', trigger: 'change' }],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## DatePicker API

### Attributes

| Attribute | Description | Type | Default |
| --------- | ----------- | ---- | ------- |
| modelValue | Bound value (single: `Date\|string\|number\|null`, range: `[start, end]\|null`) | `Date \| string \| number \| null \| [value, value]` | — |
| type | Picker type | `'date' \| 'daterange'` | `'date'` |
| readonly | Read-only (input locked, panel still opens) | `boolean` | `false` |
| disabled | Disabled (inherits form-level disabled when unset) | `boolean` | `false` |
| size | Size (inherits form-level size when unset) | `'large' \| 'main' \| 'small'` | `'main'` |
| editable | Whether manual input is allowed | `boolean` | `true` |
| clearable | Whether clearable | `boolean` | `false` |
| placeholder | Placeholder (single, falls back to locale) | `string` | — |
| startPlaceholder | Range start placeholder (falls back to locale) | `string` | — |
| endPlaceholder | Range end placeholder (falls back to locale) | `string` | — |
| rangeSeparator | Range separator | `string` | `'-'` |
| popperClass | Extra class for the panel | `string` | — |
| format | Trigger display format | `string` | `'YYYY-MM-DD'` |
| valueFormat | Bound string format (`Date` emitted when unset) | `string` | — |
| defaultValue | Date the panel opens on | `Date \| string \| number` | — |
| prefixIcon | Trigger prefix icon name | `string` | `'calendar'` |
| clearIcon | Clear icon name | `string` | `'close'` |
| disabledDate | Disabled date predicate | `(date: Date) => boolean` | — |
| cellClassName | Custom cell class name | `(date: Date) => string` | — |
| shortcuts | Panel shortcuts | `{ text: string; value: (dayjs) => Date \| [Date, Date] }[]` | — |
| firstDayOfWeek | Week start day (0=Sunday … 6=Saturday) | `number` | `7` |
| teleported | Whether the panel teleports to body | `boolean` | `true` |
| validateEvent | Whether to trigger form validation | `boolean` | `true` |
| unlinkPanels | Whether range calendars navigate independently | `boolean` | `false` |

### Events

| Event | Description | Callback parameters |
| ----- | ----------- | -------------------- |
| update:modelValue | Emitted when the value changes (clearing emits `null`) | `(value: DatePickerValue)` |
| change | Emitted when the value changes | Same as above |
| focus | Input focused | — |
| blur | Input blurred | — |
| clear | Clear icon clicked | — |
| visible-change | Panel opened/closed | `(visible: boolean)` |
| calendar-change | Start date picked in range panel | `(value: [Date, Date \| null])` |
| panel-change | Panel view/month changed | `(date: Date, mode: 'date'\|'month'\|'year', view: 'date'\|'month'\|'year')` |

### Keyboard operations

| Key | Description |
| --- | ----------- |
| → / ← | Move keyboard focus one day (panel open, date type) |
| ↓ / ↑ | Move keyboard focus one week |
| Enter | Pick the focused date when panel is open; commit typed input otherwise |
| Esc | Close the panel |
