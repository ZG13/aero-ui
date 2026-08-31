# Form

Composed of inputs, selectors and other controls, forms collect, validate and submit data. `AeroForm` serves as the container for data binding, validation rules and layout; `AeroFormItem` handles the field label, error display and validation state.

## Typical form

`AeroForm` binds data via `model` and declares validation rules via `rules`; `AeroFormItem` links a field with `prop`. Fields whose rules include `required: true` automatically show a required asterisk next to the label.

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="Username" prop="name">
      <AeroInput v-model="form.name" placeholder="Please enter username" />
    </AeroFormItem>
    <AeroFormItem label="Email" prop="email">
      <AeroInput v-model="form.email" placeholder="Please enter email" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">Submit</AeroButton>
      <AeroButton @click="reset">Reset</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ name: '', email: '' })

const rules = {
  name: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' },
  ],
}

async function submit() {
  try {
    await formRef.value.validate()
    // validation passed, submit the data
  } catch (invalidFields) {
    // validation failed, invalidFields is an error structure keyed by field name
  }
}

function reset() {
  formRef.value.resetFields()
}
</script>
```

## Inline form

`inline` lays form items out horizontally on one line, suitable for compact scenarios such as login and filters.

```vue
<template>
  <AeroForm :model="form" inline>
    <AeroFormItem label="Username" prop="name">
      <AeroInput v-model="form.name" placeholder="Please enter username" />
    </AeroFormItem>
    <AeroFormItem label="Password" prop="password">
      <AeroInput v-model="form.password" placeholder="Please enter password" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary">Login</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const form = reactive({ name: '', password: '' })
</script>
```

## Label position

`label-position` controls the label position (`left`, `right`, or `top`); `label-width` controls the label width (numbers are treated as `px`).

```vue
<template>
  <AeroForm :model="form" label-position="top" label-width="80px">
    <AeroFormItem label="Username" prop="name">
      <AeroInput v-model="form.name" placeholder="Please enter username" />
    </AeroFormItem>
    <AeroFormItem label="Email" prop="email">
      <AeroInput v-model="form.email" placeholder="Please enter email" />
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const form = reactive({ name: '', email: '' })
</script>
```

## Validation rules

`rules` supports built-in rules such as `required`, `min`, `max`, `len`, `pattern`, `type`, `enum` and `whitespace`. When a rule omits `message`, it falls back to the locale default (updating automatically on language switch); `trigger` specifies when the rule runs (`blur` / `change` / `submit`, defaulting to submit validation).

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="Age" prop="age">
      <AeroInput v-model="form.age" placeholder="Please enter age" />
    </AeroFormItem>
    <AeroFormItem label="Username" prop="name">
      <AeroInput v-model="form.name" placeholder="Please enter username" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">Validate</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ age: '', name: '' })

const rules = {
  age: [
    { required: true, trigger: 'blur' },
    { type: 'integer', min: 1, max: 120, trigger: 'blur' },
  ],
  name: [
    { required: true, trigger: 'blur' },
    { min: 2, max: 20, trigger: 'blur' },
  ],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## Custom validation

`validator` provides synchronous custom validation; `asyncValidator` provides asynchronous validation (returns a Promise — resolve to pass, reject to report an error).

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="Username" prop="name">
      <AeroInput v-model="form.name" placeholder="Please enter username" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">Validate</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ name: '' })

const rules = {
  name: [
    {
      validator: (rule, value, callback) => {
        if (value === 'aero') callback()
        else callback('Username must be "aero"')
      },
      trigger: 'blur',
    },
  ],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="120px">
    <AeroFormItem label="Username" prop="name">
      <AeroInput v-model="form.name" placeholder="Please enter username" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">Validate</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ name: '' })

const rules = {
  name: [
    {
      asyncValidator: (rule, value) =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (value === 'aero') resolve()
            else reject('Username is already taken')
          }, 1000)
        }),
      trigger: 'blur',
    },
  ],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## Form-level size and disabled

Form-level `size` / `disabled` propagate to inner controls automatically; a form item or control can override them, with priority "control itself → form item → form".

```vue
<template>
  <AeroForm :model="form" size="small" disabled>
    <AeroFormItem label="Username" prop="name">
      <AeroInput v-model="form.name" placeholder="Inherits form size and disabled" />
    </AeroFormItem>
    <AeroFormItem label="Email" prop="email" :disabled="false">
      <AeroInput v-model="form.email" placeholder="Overridden to enabled" />
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const form = reactive({ name: 'Aero UI', email: '' })
</script>
```

## Validation methods

Call instance methods `validate`, `validateField`, `resetFields` and `clearValidate` through a template `ref`.

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="Username" prop="name">
      <AeroInput v-model="form.name" placeholder="Please enter username" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">Submit</AeroButton>
      <AeroButton @click="validateName">Validate username</AeroButton>
      <AeroButton @click="reset">Reset</AeroButton>
      <AeroButton @click="clear">Clear validation</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ name: '' })

const rules = {
  name: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
}

async function submit() {
  try {
    await formRef.value.validate()
  } catch (invalidFields) {
    // validation failed
  }
}

function validateName() {
  formRef.value.validateField('name').catch(() => {})
}

function reset() {
  formRef.value.resetFields()
}

function clear() {
  formRef.value.clearValidate()
}
</script>
```

## Form API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| model | Form data object | `Record<string, unknown>` | `{}` |
| rules | Validation rules, keyed by field name | `FormRules` | `{}` |
| label-width | Label width (numbers are treated as px) | `string \| number` | `'auto'` |
| label-position | Label position | `'left' \| 'right' \| 'top'` | `'right'` |
| inline | Whether to lay out inline | `boolean` | `false` |
| size | Form-level size, passed to inner controls | `'large' \| 'main' \| 'small'` | — |
| disabled | Whether to disable the whole form | `boolean` | `false` |
| show-message | Whether to show validation messages | `boolean` | `true` |
| status-icon | Whether to show validation status icons | `boolean` | `false` |
| scroll-to-error | Whether to scroll to the first invalid field on failure | `boolean` | `false` |

### Methods

| Name | Description | Arguments | Returns |
| ---- | ----------- | --------- | ------- |
| validate | Validate all fields; resolves `true` on success, rejects an error structure keyed by field name on failure | `callback?` | `Promise<boolean>` |
| validateField | Validate specific fields (all when omitted) | `props?`, `callback?` | `Promise<boolean>` |
| resetFields | Restore specific/all fields to initial values and clear validation state | `props?` | — |
| clearValidate | Clear validation state and messages for specific/all fields | `props?` | — |
| scrollToField | Scroll to a specific field | `prop` | — |

### Events

| Name | Description | Arguments |
| ---- | ----------- | --------- |
| validate | Emitted after a field finishes validation | `(prop: string, isValid: boolean, message: string)` |

## FormItem API

### Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| prop | Field name, linking the model field and validation rules | `string` | — |
| label | Label text | `string` | `''` |
| label-width | Label width, overrides the form-level value | `string \| number` | — |
| required | Whether required, shows a required asterisk next to the label | `boolean` | `false` |
| rules | Form-item-level rules, overriding the form-level rules | `FormItemRule \| FormItemRule[]` | — |
| error | Manual error message, overriding validation errors | `string` | — |
| show-message | Whether to show the error message | `boolean` | `true` |
| size | Form-item-level size, inherits the form-level value when omitted | `'large' \| 'main' \| 'small'` | — |
| disabled | Form-item-level disabled, inherits the form-level value when omitted | `boolean` | `false` |
| validate-status | Manually controlled validation state | `'' \| 'error' \| 'validating'` | — |

### Slots

| Name | Description |
| ---- | ----------- |
| label | Custom label content |
| default | Field content (the control) |
| error | Custom error display, scoped slot `{ error }` |

### Methods

| Name | Description | Arguments | Returns |
| ---- | ----------- | --------- | ------- |
| validate | Validate the field (filters rules by `trigger`) | `trigger?` | `Promise<FieldError[]>` |
| resetField | Reset the field to its initial value and clear validation state | — | — |
| clearValidate | Clear the field validation state and message | — | — |

## FormItemRule

`FormItemRule` aligns with async-validator rule items but uses strict types (no `any`). Rules fall back to the locale default message when `message` is omitted.

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| required | Whether required | `boolean` | `false` |
| min | Minimum value / minimum length | `number` | — |
| max | Maximum value / maximum length | `number` | — |
| len | Exact length | `number` | — |
| pattern | Regular expression match | `RegExp` | — |
| type | Value type | `'string' \| 'number' \| 'boolean' \| 'integer' \| 'float' \| 'array' \| 'object' \| 'date' \| 'email' \| 'url' \| 'enum'` | — |
| enum | Allowed values | `Array<string \| number \| boolean>` | — |
| whitespace | Whether to trim leading/trailing whitespace | `boolean` | `false` |
| message | Custom error message | `string` | — |
| trigger | When this rule runs | `'blur' \| 'change' \| 'submit'` | — |
| validator | Custom synchronous validation function | `(rule, value, callback) => void` | — |
| asyncValidator | Custom asynchronous validation function | `(rule, value, callback) => Promise<void>` | — |
