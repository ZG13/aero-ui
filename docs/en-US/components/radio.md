# Radio

Select a single option from a set of mutually exclusive choices. Supports dot and button visual styles, works standalone or grouped, and integrates seamlessly with the form context.

## Basic usage

Wrap several `AeroRadio` items in an `AeroRadioGroup` and bind the selected value with `v-model`; `value` specifies the option value and the default slot holds the option label.

```vue
<template>
  <AeroRadioGroup v-model="city">
    <AeroRadio value="shanghai">Shanghai</AeroRadio>
    <AeroRadio value="beijing">Beijing</AeroRadio>
    <AeroRadio value="shenzhen">Shenzhen</AeroRadio>
  </AeroRadioGroup>
  <p class="demo-radio-value">Selected: {{ city }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const city = ref('shanghai')
</script>

<style>
.demo-radio-value {
  margin-top: 8px;
  font-size: 13px;
}
</style>
```

## Disabled

Set `disabled` on an `AeroRadio` to disable a single option, or on the `AeroRadioGroup` to disable all options in the group.

```vue
<template>
  <AeroRadioGroup v-model="plan">
    <AeroRadio value="basic">Basic</AeroRadio>
    <AeroRadio value="pro" disabled>Pro (unavailable)</AeroRadio>
    <AeroRadio value="enterprise">Enterprise</AeroRadio>
  </AeroRadioGroup>
  <AeroRadioGroup v-model="plan2" disabled style="margin-top: 12px">
    <AeroRadio value="monthly">Monthly</AeroRadio>
    <AeroRadio value="yearly">Yearly</AeroRadio>
  </AeroRadioGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const plan = ref('basic')
const plan2 = ref('yearly')
</script>
```

## Size

Use `size` to set the size: `large` / `main` / `small`. The size difference is more visible with `border` or button style.

```vue
<template>
  <AeroRadioGroup v-model="val" size="large">
    <AeroRadio value="1" border>Large</AeroRadio>
    <AeroRadio value="2" border>Large</AeroRadio>
  </AeroRadioGroup>
  <AeroRadioGroup v-model="val" size="small" style="margin-top: 12px">
    <AeroRadio value="1" border>Small</AeroRadio>
    <AeroRadio value="2" border>Small</AeroRadio>
  </AeroRadioGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const val = ref('1')
</script>
```

## With border

Set `border` on an `AeroRadio` to show an outer border for a card-like option appearance.

```vue
<template>
  <AeroRadioGroup v-model="type">
    <AeroRadio value="text" border>Text message</AeroRadio>
    <AeroRadio value="voice" border>Voice message</AeroRadio>
    <AeroRadio value="video" border>Video message</AeroRadio>
  </AeroRadioGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const type = ref('text')
</script>
```

## Button style

Use `AeroRadioButton` instead of `AeroRadio` for a button appearance; customize the checked background and text color of button-style items via `fill` and `textColor` on the `AeroRadioGroup`.

```vue
<template>
  <AeroRadioGroup v-model="pay">
    <AeroRadioButton value="alipay">Alipay</AeroRadioButton>
    <AeroRadioButton value="wechat">WeChat Pay</AeroRadioButton>
    <AeroRadioButton value="card">Bank card</AeroRadioButton>
  </AeroRadioGroup>
  <AeroRadioGroup
    v-model="pay2"
    fill="#7c3aed"
    text-color="#ffffff"
    style="margin-top: 12px"
  >
    <AeroRadioButton value="alipay">Alipay</AeroRadioButton>
    <AeroRadioButton value="wechat">WeChat Pay</AeroRadioButton>
    <AeroRadioButton value="card">Bank card</AeroRadioButton>
  </AeroRadioGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const pay = ref('alipay')
const pay2 = ref('wechat')
</script>
```

## Form integration

Inside `AeroForm`/`AeroFormItem`, it inherits form/form-item-level `size`/`disabled` and triggers field validation when the selected value changes.

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="Gender" prop="gender">
      <AeroRadioGroup v-model="form.gender">
        <AeroRadio value="male">Male</AeroRadio>
        <AeroRadio value="female">Female</AeroRadio>
      </AeroRadioGroup>
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">Submit</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ gender: '' })

const rules = {
  gender: [{ required: true, message: 'Please select a gender', trigger: 'change' }],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## Radio API

### Radio Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| value | Option value (written to the binding value when checked; falls back to label when omitted) | `string \| number \| boolean` | — |
| label | Option value (deprecated alias, same semantics as value) @deprecated | `string \| number \| boolean` | — |
| modelValue | Binding value (effective standalone; group value takes precedence inside a RadioGroup) | `string \| number \| boolean` | — |
| disabled | Whether this option is disabled (stacks with group disabled inside a group) | `boolean` | `false` |
| border | Whether to show the outer border | `boolean` | `false` |
| size | Size (effective with border or button style; inherits group/form size when omitted) | `'large' \| 'main' \| 'small'` | `'main'` |
| name | Native radio name attribute (same name within a group enables keyboard navigation) | `string` | — |

### RadioGroup Attributes

| Name | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| modelValue | Group binding value: at most one option matching it appears checked | `string \| number \| boolean` | — |
| size | Size for all child options (child's own size takes precedence) | `'large' \| 'main' \| 'small'` | `'main'` |
| disabled | Whether to disable all child options in the group | `boolean` | `false` |
| fill | Checked background color of button-style child options | `string` | — |
| textColor | Checked text color of button-style child options | `string` | — |
| name | Native radio name attribute passed to all child options | `string` | — |
| validateEvent | Whether to trigger form validation when the value changes | `boolean` | `true` |
| label | Native aria-label (accessibility label) | `string` | — |

### Events

| Name | Description | Arguments |
| ---- | ----------- | --------- |
| update:modelValue | Emitted when the binding value updates | `(value: string \| number \| boolean)` |
| change | Emitted when the selected value changes (not emitted when clicking the checked option) | same as above |
