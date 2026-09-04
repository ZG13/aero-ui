# DatePicker 日期选择框

通过日历面板选择单个日期或日期范围。交互对齐 element-plus：支持年/月视图切换、前后月补位日期可选、范围 hover 预览、手动输入、快捷选项与键盘导航。

## 单日期

`type="date"`（默认）选择单个日期，`v-model` 绑定值。面板头部可点击年份、月份切换至年视图 / 月视图。

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

`type="daterange"` 选择起止日期范围，面板为双日历并排，`v-model` 绑定 `[start, end]` 数组。选定起始日期后移动鼠标可实时预览范围，再次点击完成选择。

```vue
<template>
  <AeroDatePicker v-model="value" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref<[string, string] | undefined>()
</script>
```

### 范围面板导航

默认左右日历联动导航（始终相邻）；`unlink-panels` 使左右日历互相独立。`range-separator` 自定义触发器分隔符。

```vue
<template>
  <AeroDatePicker v-model="value" type="daterange" unlink-panels range-separator="至" />
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

## 手动输入

`editable`（默认 `true`）时可直接在输入框输入日期，按 `Enter` 或失焦提交；解析失败自动恢复回显。`readonly` 输入框只读但面板可打开。

```vue
<template>
  <AeroDatePicker v-model="value" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## 快捷选项

`shortcuts` 配置面板左侧快捷项，`value` 返回选中值（范围组件返回数组）。

```vue
<template>
  <AeroDatePicker v-model="value" type="daterange" :shortcuts="shortcuts" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref<[string, string] | undefined>()

const shortcuts = [
  { text: '最近一周', value: (dayjs) => { const end = dayjs(); return [end.subtract(7, 'day').toDate(), end.toDate()] } },
  { text: '最近一月', value: (dayjs) => { const end = dayjs(); return [end.subtract(1, 'month').toDate(), end.toDate()] } },
]
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

## 可清空与默认值

`clearable` 有值时（hover 或聚焦）展示清空入口，清空派发 `null`；`default-value` 控制打开面板时定位的月份。

```vue
<template>
  <AeroDatePicker v-model="value" clearable default-value="2024-01-01" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('2024-01-15')
</script>
```

## 周起始日

`first-day-of-week` 设置周起始日（0=周日 … 6=周六，默认 7 即周日起始）。

```vue
<template>
  <AeroDatePicker v-model="value" :first-day-of-week="1" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## 表单集成

置于 `AeroForm`/`AeroFormItem` 内时，自动继承表单/表单项级 `size`/`disabled`，并在 blur/change 触发字段即时校验（`validate-event` 为 `false` 时关闭）。

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
| modelValue | 绑定值（单日期 `Date\|string\|number\|null`，范围 `[start, end]\|null`） | `Date \| string \| number \| null \| [value, value]` | — |
| type | 类型 | `'date' \| 'daterange'` | `'date'` |
| readonly | 是否只读（输入框只读，面板可打开） | `boolean` | `false` |
| disabled | 是否禁用（缺省继承表单级 disabled） | `boolean` | `false` |
| size | 尺寸（缺省继承表单级 size） | `'large' \| 'main' \| 'small'` | `'main'` |
| editable | 是否可手动输入 | `boolean` | `true` |
| clearable | 是否可清空 | `boolean` | `false` |
| placeholder | 占位文案（单日期，缺省走 locale） | `string` | — |
| startPlaceholder | 范围起始占位（缺省走 locale） | `string` | — |
| endPlaceholder | 范围结束占位（缺省走 locale） | `string` | — |
| rangeSeparator | 范围分隔符 | `string` | `'-'` |
| popperClass | 面板附加类名 | `string` | — |
| format | 触发器展示格式 | `string` | `'YYYY-MM-DD'` |
| valueFormat | 绑定值字符串格式（未设置派发 `Date`） | `string` | — |
| defaultValue | 打开面板时定位的日期 | `Date \| string \| number` | — |
| prefixIcon | 触发器前置图标名 | `string` | `'calendar'` |
| clearIcon | 清除图标名 | `string` | `'close'` |
| disabledDate | 禁用日期判断函数 | `(date: Date) => boolean` | — |
| cellClassName | 自定义单元格类名 | `(date: Date) => string` | — |
| shortcuts | 面板快捷选项 | `{ text: string; value: (dayjs) => Date \| [Date, Date] }[]` | — |
| firstDayOfWeek | 周起始日（0=周日 … 6=周六） | `number` | `7` |
| teleported | 面板是否 Teleport 到 body | `boolean` | `true` |
| validateEvent | 是否触发表单校验 | `boolean` | `true` |
| unlinkPanels | 范围面板左右日历是否独立 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| update:modelValue | 日期变化时触发（清空派发 `null`） | `(value: DatePickerValue)` |
| change | 日期变化时触发 | 同上 |
| focus | 输入框聚焦时触发 | — |
| blur | 输入框失焦时触发 | — |
| clear | 点击清空入口时触发 | — |
| visible-change | 面板展开/收起时触发 | `(visible: boolean)` |
| calendar-change | 范围面板选定起始日期时触发 | `(value: [Date, Date \| null])` |
| panel-change | 面板视图或月份变化时触发 | `(date: Date, mode: 'date'\|'month'\|'year', view: 'date'\|'month'\|'year')` |

### 键盘操作

| 按键 | 说明 |
| ---- | ---- |
| → / ← | 移动键盘焦点一天（面板打开，date 类型） |
| ↓ / ↑ | 移动键盘焦点一周 |
| Enter | 面板打开时选中焦点日期；未打开时提交输入 |
| Esc | 关闭面板 |
