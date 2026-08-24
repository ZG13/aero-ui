# Input 输入框

通过鼠标或键盘输入内容，支持受控值、禁用与清空。

## 基础用法

使用 `v-model` 绑定受控值。

```vue
<template>
  <AeroInput v-model="value" placeholder="请输入内容" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## 禁用

`disabled` 使输入框不可编辑。

```vue
<template>
  <AeroInput v-model="value" disabled />
</template>
```

## 可清空

`clearable` 有值时展示清空入口，点击清空并派发 `clear`。

```vue
<template>
  <AeroInput v-model="value" clearable placeholder="请输入内容" />
</template>
```

## 尺寸

通过 `size` 控制输入框尺寸，支持 `large`、`main`、`small`。

```vue
<template>
  <AeroInput v-model="value" size="large" placeholder="大尺寸" />
  <AeroInput v-model="value" size="main" placeholder="中尺寸" />
  <AeroInput v-model="value" size="small" placeholder="小尺寸" />
</template>
```

## API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| modelValue | 绑定值 | `string \| number` | — |
| placeholder | 占位文本（未提供时回退到 locale 默认文案） | `string` | — |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `false` |
| size | 输入框尺寸 | `'large' \| 'main' \| 'small'` | `'main'` |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| update:modelValue | 值更新时触发 | `(value: string \| number)` |
| input | 输入时触发 | `(value: string \| number)` |
| change | 失焦且值变化时触发 | `(value: string \| number)` |
| focus | 获得焦点时触发 | `(event: FocusEvent)` |
| blur | 失去焦点时触发 | `(event: FocusEvent)` |
| clear | 点击清空入口时触发 | — |
