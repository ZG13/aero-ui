# Select 下拉选择

当选项过多时，使用下拉菜单展示并选择内容。`AeroSelect` 承载选择逻辑与面板，`AeroOption` 声明选项。

## 基础用法

使用 `v-model` 绑定选中值，`AeroOption` 的 `label` 为回显文案、`value` 为选中值。空值展示占位文案。

```vue
<template>
  <AeroSelect v-model="value" placeholder="请选择城市">
    <AeroOption label="北京" value="beijing" />
    <AeroOption label="上海" value="shanghai" />
    <AeroOption label="广州" value="guangzhou" />
    <AeroOption label="深圳" value="shenzhen" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## 可清空

`clearable` 有选中值时展示清空入口，点击清空并派发 `clear`。

```vue
<template>
  <AeroSelect v-model="value" clearable placeholder="请选择城市">
    <AeroOption label="北京" value="beijing" />
    <AeroOption label="上海" value="shanghai" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('shanghai')
</script>
```

## 多选

`multiple` 开启多选，`model-value` 绑定数组；选中值以标签回显，可点击标签删除入口移出单个值。

```vue
<template>
  <AeroSelect v-model="value" multiple clearable placeholder="请选择城市">
    <AeroOption label="北京" value="beijing" />
    <AeroOption label="上海" value="shanghai" />
    <AeroOption label="广州" value="guangzhou" />
    <AeroOption label="深圳" value="shenzhen" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(['beijing', 'shanghai'])
</script>
```

## 可搜索

`filterable` 开启本地搜索，输入关键词按选项标签过滤（大小写不敏感）；无匹配时展示空态。

```vue
<template>
  <AeroSelect v-model="value" filterable placeholder="请选择或搜索城市">
    <AeroOption label="北京" value="beijing" />
    <AeroOption label="上海" value="shanghai" />
    <AeroOption label="广州" value="guangzhou" />
    <AeroOption label="深圳" value="shenzhen" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## 禁用

`disabled` 禁用整个选择器；`AeroOption` 的 `disabled` 禁用单个选项。

```vue
<template>
  <AeroSelect v-model="value" placeholder="请选择城市">
    <AeroOption label="北京" value="beijing" />
    <AeroOption label="上海" value="shanghai" disabled />
    <AeroOption label="广州" value="guangzhou" />
  </AeroSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
```

## 表单集成

置于 `AeroForm`/`AeroFormItem` 内时，自动继承表单/表单项级 `size`/`disabled`，并在 blur/change 触发字段即时校验。

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="城市" prop="city">
      <AeroSelect v-model="form.city" placeholder="请选择城市">
        <AeroOption label="北京" value="beijing" />
        <AeroOption label="上海" value="shanghai" />
      </AeroSelect>
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">提交</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ city: '' })

const rules = {
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## Select API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| modelValue | 绑定值，单选 `string \| number`、多选数组 | `string \| number \| (string \| number)[]` | — |
| multiple | 是否多选 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `false` |
| filterable | 是否可搜索（本地过滤） | `boolean` | `false` |
| placeholder | 占位文案（未提供时回退到 locale 默认文案） | `string` | — |
| disabled | 是否禁用（缺省继承表单级 disabled） | `boolean` | `false` |
| size | 尺寸（缺省继承表单级 size） | `'large' \| 'main' \| 'small'` | `'main'` |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| update:modelValue | 选中值变化时触发 | `(value: string \| number \| (string \| number)[] \| undefined)` |
| change | 选中值变化时触发 | 同上 |
| clear | 点击清空入口时触发 | — |
| visible-change | 面板展开/收起时触发 | `(visible: boolean)` |

## Option API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| label | 选项标签（回显与搜索匹配用） | `string \| number` | — |
| value | 选项值 | `string \| number` | — |
| disabled | 是否禁用该选项 | `boolean` | `false` |
