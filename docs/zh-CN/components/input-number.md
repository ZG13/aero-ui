# InputNumber 数字输入框

通过鼠标点击步进按钮或键盘输入数值，支持步长、边界、精度与严格步进控制。

## 基础用法

使用 `v-model` 绑定数值，右侧步进按钮按 `step`（默认 1）增减。

```vue
<template>
  <AeroInputNumber v-model="value" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(1)
</script>
```

## 步长

`step` 控制每次步进的增量。

```vue
<template>
  <AeroInputNumber v-model="value" :step="5" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(0)
</script>
```

## 边界

`min`/`max` 限制取值范围，到达边界时对应步进按钮禁用。

```vue
<template>
  <AeroInputNumber v-model="value" :min="0" :max="100" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(50)
</script>
```

## 精度与严格步进

`precision` 控制小数位数；`step-strictly` 使输入值对齐到 `step` 倍数。

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

## 禁用与只读

`disabled` 完全禁用；`readonly` 禁止键盘输入但允许步进按钮操作。

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

## 关闭步进按钮

`controls` 为 `false` 时隐藏步进按钮，仅保留输入框。

```vue
<template>
  <AeroInputNumber v-model="value" :controls="false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(1)
</script>
```

## 表单集成

置于 `AeroForm`/`AeroFormItem` 内时，自动继承表单/表单项级 `size`/`disabled`，并在 blur/change 触发字段即时校验。

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="数量" prop="count">
      <AeroInputNumber v-model="form.count" :min="1" :max="99" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">提交</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ count: 1 })

const rules = {
  count: [{ required: true, message: '请输入数量', trigger: 'change' }],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## InputNumber API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| modelValue | 绑定值 | `number` | — |
| step | 步长 | `number` | `1` |
| min | 最小值 | `number` | `-Infinity` |
| max | 最大值 | `number` | `Infinity` |
| precision | 小数精度（四舍五入位数） | `number` | — |
| stepStrictly | 是否严格步进（输入对齐 step 倍数） | `boolean` | `false` |
| controls | 是否显示步进按钮 | `boolean` | `true` |
| disabled | 是否禁用（缺省继承表单级 disabled） | `boolean` | `false` |
| size | 尺寸（缺省继承表单级 size） | `'large' \| 'main' \| 'small'` | `'main'` |
| readonly | 是否只读（禁键盘输入但允许步进） | `boolean` | `false` |
| placeholder | 占位文案 | `string` | — |
| name | 原生 name 属性，透传到内部输入元素 | `string` | — |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| update:modelValue | 数值变化时触发 | `(value: number \| undefined)` |
| change | 数值变化时触发 | 同上 |
| focus | 获得焦点时触发 | `(event: FocusEvent)` |
| blur | 失去焦点时触发 | `(event: FocusEvent)` |
