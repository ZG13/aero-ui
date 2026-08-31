# Form 表单

由输入框、选择器等控件组成，用以收集、校验和提交数据。`AeroForm` 作为表单容器负责数据绑定、校验规则与布局，`AeroFormItem` 负责字段的标签、错误展示与校验状态。

## 典型表单

`AeroForm` 通过 `model` 绑定数据、`rules` 声明校验规则，`AeroFormItem` 以 `prop` 关联字段。含 `required: true` 规则的字段会自动在标签旁展示必填星号。

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="用户名" prop="name">
      <AeroInput v-model="form.name" placeholder="请输入用户名" />
    </AeroFormItem>
    <AeroFormItem label="邮箱" prop="email">
      <AeroInput v-model="form.email" placeholder="请输入邮箱" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">提交</AeroButton>
      <AeroButton @click="reset">重置</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ name: '', email: '' })

const rules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

async function submit() {
  try {
    await formRef.value.validate()
    // 校验通过，提交数据
  } catch (invalidFields) {
    // 校验失败，invalidFields 为按字段名组织的错误结构
  }
}

function reset() {
  formRef.value.resetFields()
}
</script>
```

## 行内表单

`inline` 使表单项在同一行内水平排列，适用于登录、筛选等紧凑场景。

```vue
<template>
  <AeroForm :model="form" inline>
    <AeroFormItem label="用户名" prop="name">
      <AeroInput v-model="form.name" placeholder="请输入用户名" />
    </AeroFormItem>
    <AeroFormItem label="密码" prop="password">
      <AeroInput v-model="form.password" placeholder="请输入密码" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary">登录</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const form = reactive({ name: '', password: '' })
</script>
```

## 标签位置

`label-position` 控制标签位置，支持 `left`、`right`、`top`；`label-width` 控制标签宽度（数值自动按 `px` 处理）。

```vue
<template>
  <AeroForm :model="form" label-position="top" label-width="80px">
    <AeroFormItem label="用户名" prop="name">
      <AeroInput v-model="form.name" placeholder="请输入用户名" />
    </AeroFormItem>
    <AeroFormItem label="邮箱" prop="email">
      <AeroInput v-model="form.email" placeholder="请输入邮箱" />
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const form = reactive({ name: '', email: '' })
</script>
```

## 校验规则

`rules` 支持 `required`、`min`、`max`、`len`、`pattern`、`type`、`enum`、`whitespace` 等内置规则。规则缺省 `message` 时回退到 locale 内置文案（随语言切换自动更新）；`trigger` 指定校验时机（`blur` / `change` / `submit`），缺省在提交校验时执行。

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="年龄" prop="age">
      <AeroInput v-model="form.age" placeholder="请输入年龄" />
    </AeroFormItem>
    <AeroFormItem label="用户名" prop="name">
      <AeroInput v-model="form.name" placeholder="请输入用户名" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">校验</AeroButton>
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

## 自定义校验

`validator` 提供同步自定义校验，`asyncValidator` 提供异步自定义校验（返回 Promise，resolve 通过、reject 报错）。

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="用户名" prop="name">
      <AeroInput v-model="form.name" placeholder="请输入用户名" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">校验</AeroButton>
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
        else callback('用户名必须为 aero')
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
    <AeroFormItem label="用户名" prop="name">
      <AeroInput v-model="form.name" placeholder="请输入用户名" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">校验</AeroButton>
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
            else reject('用户名已被占用')
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

## 表单级尺寸与禁用

表单级 `size` / `disabled` 自动传递给内部控件；表单项或控件可单独覆盖，优先级为「控件自身 → 表单项 → 表单」。

```vue
<template>
  <AeroForm :model="form" size="small" disabled>
    <AeroFormItem label="用户名" prop="name">
      <AeroInput v-model="form.name" placeholder="继承表单级尺寸与禁用" />
    </AeroFormItem>
    <AeroFormItem label="邮箱" prop="email" :disabled="false">
      <AeroInput v-model="form.email" placeholder="表单项覆盖为可用" />
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const form = reactive({ name: 'Aero UI', email: '' })
</script>
```

## 校验方法

通过模板 `ref` 调用 `validate`、`validateField`、`resetFields`、`clearValidate` 等实例方法。

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="用户名" prop="name">
      <AeroInput v-model="form.name" placeholder="请输入用户名" />
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">提交</AeroButton>
      <AeroButton @click="validateName">校验用户名</AeroButton>
      <AeroButton @click="reset">重置</AeroButton>
      <AeroButton @click="clear">清除校验状态</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ name: '' })

const rules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
}

async function submit() {
  try {
    await formRef.value.validate()
  } catch (invalidFields) {
    // 校验失败
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

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| model | 表单数据对象 | `Record<string, unknown>` | `{}` |
| rules | 校验规则，按字段名声明 | `FormRules` | `{}` |
| label-width | 标签宽度（数值按 px 处理） | `string \| number` | `'auto'` |
| label-position | 标签位置 | `'left' \| 'right' \| 'top'` | `'right'` |
| inline | 是否行内布局 | `boolean` | `false` |
| size | 表单级尺寸，传递给内部控件 | `'large' \| 'main' \| 'small'` | — |
| disabled | 是否禁用整表 | `boolean` | `false` |
| show-message | 是否展示校验消息 | `boolean` | `true` |
| status-icon | 是否展示校验状态图标 | `boolean` | `false` |
| scroll-to-error | 校验失败时是否滚动到第一个错误字段 | `boolean` | `false` |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
| ------ | ---- | ---- | ------ |
| validate | 校验全部字段，通过 resolve `true`，失败 reject 按字段名组织的错误结构 | `callback?` | `Promise<boolean>` |
| validateField | 校验指定字段（未传时校验全部） | `props?`, `callback?` | `Promise<boolean>` |
| resetFields | 恢复指定/全部字段至初始值并清除校验状态 | `props?` | — |
| clearValidate | 清除指定/全部字段的校验状态与错误信息 | `props?` | — |
| scrollToField | 滚动到指定字段 | `prop` | — |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| validate | 字段校验完成后触发 | `(prop: string, isValid: boolean, message: string)` |

## FormItem API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| prop | 字段名，关联表单 `model` 字段与校验规则 | `string` | — |
| label | 标签文案 | `string` | `''` |
| label-width | 标签宽度，覆盖表单级 | `string \| number` | — |
| required | 是否必填，在标签旁展示必填星号 | `boolean` | `false` |
| rules | 表单项级校验规则，覆盖表单级 | `FormItemRule \| FormItemRule[]` | — |
| error | 手动错误信息，覆盖校验产生的错误消息 | `string` | — |
| show-message | 是否展示错误消息 | `boolean` | `true` |
| size | 表单项级尺寸，缺省继承表单级 | `'large' \| 'main' \| 'small'` | — |
| disabled | 表单项级禁用，缺省继承表单级 | `boolean` | `false` |
| validate-status | 手动控制的校验状态 | `'' \| 'error' \| 'validating'` | — |

### Slots

| 插槽名 | 说明 |
| ------ | ---- |
| label | 自定义标签内容 |
| default | 字段内容（控件） |
| error | 自定义错误展示，作用域插槽 `{ error }` |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
| ------ | ---- | ---- | ------ |
| validate | 校验字段（按 `trigger` 过滤规则） | `trigger?` | `Promise<FieldError[]>` |
| resetField | 重置字段至初始值并清除校验状态 | — | — |
| clearValidate | 清除字段校验状态与错误信息 | — | — |

## FormItemRule 校验规则

`FormItemRule` 对齐 async-validator 规则项，但采用严格类型（无 `any`）。规则缺省 `message` 时回退到 locale 内置文案。

| 属性 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| required | 是否必填 | `boolean` | `false` |
| min | 最小值 / 最小长度 | `number` | — |
| max | 最大值 / 最大长度 | `number` | — |
| len | 精确长度 | `number` | — |
| pattern | 正则匹配 | `RegExp` | — |
| type | 值类型 | `'string' \| 'number' \| 'boolean' \| 'integer' \| 'float' \| 'array' \| 'object' \| 'date' \| 'email' \| 'url' \| 'enum'` | — |
| enum | 枚举允许的取值集合 | `Array<string \| number \| boolean>` | — |
| whitespace | 是否忽略首尾空格 | `boolean` | `false` |
| message | 自定义错误提示文案 | `string` | — |
| trigger | 触发本规则校验的时机 | `'blur' \| 'change' \| 'submit'` | — |
| validator | 自定义同步校验函数 | `(rule, value, callback) => void` | — |
| asyncValidator | 自定义异步校验函数 | `(rule, value, callback) => Promise<void>` | — |
