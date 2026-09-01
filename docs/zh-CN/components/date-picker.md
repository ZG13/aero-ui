# DatePicker 日期选择框

通过日历面板选择单个日期或日期范围，支持格式化、禁用日期与清空。

## 单日期

`type="date"`（默认）选择单个日期，`v-model` 绑定值。

```vue
<template>
  <AeroDatePicker v-model="value" placeholder="请选择日期" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## 日期范围

`type="daterange"` 选择起止日期范围，绑定 `[start, end]` 数组。

```vue
<template>
  <AeroDatePicker v-model="value" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref<[string, string] | undefined>()
</script>
```

## 格式化

`format` 控制触发器展示格式；`value-format` 控制绑定值字符串格式（未设置时派发 `Date` 对象）。

```vue
<template>
  <AeroDatePicker v-model="value" format="YYYY 年 M 月 D 日" value-format="YYYY/MM/DD" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## 禁用日期

`disabled-date` 返回 `true` 的日期在面板中禁用。

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

## 可清空与只读

`clearable` 有值时展示清空入口；`editable` 为 `false` 时输入框只读、仅可日历选择。

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

## 表单集成

置于 `AeroForm`/`AeroFormItem` 内时，自动继承表单/表单项级 `size`/`disabled`，并在 blur/change 触发字段即时校验。

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="日期" prop="date">
      <AeroDatePicker v-model="form.date" placeholder="请选择日期" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">提交</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ date: '' })

const rules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## DatePicker API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| modelValue | 绑定值（单日期 `Date\|string\|number`，范围 `[start, end]`） | `Date \| string \| number \| [Date\|string\|number, Date\|string\|number]` | — |
| type | 类型 | `'date' \| 'daterange'` | `'date'` |
| format | 触发器展示格式 | `string` | `'YYYY-MM-DD'` |
| valueFormat | 绑定值字符串格式（未设置派发 `Date`） | `string` | — |
| placeholder | 占位文案（单日期） | `string` | — |
| startPlaceholder | 范围起始占位 | `string` | — |
| endPlaceholder | 范围结束占位 | `string` | — |
| disabled | 是否禁用（缺省继承表单级 disabled） | `boolean` | `false` |
| size | 尺寸（缺省继承表单级 size） | `'large' \| 'main' \| 'small'` | `'main'` |
| disabledDate | 禁用日期判断函数 | `(date: Date) => boolean` | — |
| clearable | 是否可清空 | `boolean` | `false` |
| editable | 是否可编辑（false 时输入框只读） | `boolean` | `true` |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| update:modelValue | 日期变化时触发 | `(value: Date \| string \| [Date, Date] \| [string, string] \| undefined)` |
| change | 日期变化时触发 | 同上 |
| clear | 点击清空入口时触发 | — |
| visible-change | 面板展开/收起时触发 | `(visible: boolean)` |
