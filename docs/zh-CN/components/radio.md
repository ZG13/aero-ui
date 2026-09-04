# Radio 单选框

在多个互斥选项中选择其一，支持圆点、按钮两种视觉样式，可独立使用或分组使用，并无缝接入表单上下文。

## 基础用法

使用 `AeroRadioGroup` 包裹若干 `AeroRadio`，通过 `v-model` 绑定组选中值；`value` 指定选项值，默认插槽为选项文案。

```vue
<template>
  
  <AeroRadioGroup v-model="city">
    <AeroRadio value="shanghai">上海</AeroRadio>
    <AeroRadio value="beijing">北京</AeroRadio>
    <AeroRadio value="shenzhen">深圳</AeroRadio>
  </AeroRadioGroup>
  <p class="demo-radio-value">当前选中：{{ city }}</p>
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

## 禁用

在 `AeroRadio` 上设置 `disabled` 禁用单个选项；在 `AeroRadioGroup` 上设置 `disabled` 禁用组内所有选项。

```vue
<template>
  <AeroRadioGroup v-model="plan">
    <AeroRadio value="basic">基础版</AeroRadio>
    <AeroRadio value="pro" disabled>专业版（暂不可选）</AeroRadio>
    <AeroRadio value="enterprise">企业版</AeroRadio>
  </AeroRadioGroup>
  <AeroRadioGroup v-model="plan2" disabled style="margin-top: 12px">
    <AeroRadio value="monthly">按月</AeroRadio>
    <AeroRadio value="yearly">按年</AeroRadio>
  </AeroRadioGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const plan = ref('basic')
const plan2 = ref('yearly')
</script>
```

## 尺寸

通过 `size` 设置尺寸，支持 `large` / `main` / `small` 三档；`size` 在边框或按钮样式下视觉差异更明显。

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

## 边框

在 `AeroRadio` 上设置 `border` 显示外边框，呈现卡片式选项外观。

```vue
<template>
  <AeroRadioGroup v-model="type">
    <AeroRadio value="text" border>文字消息</AeroRadio>
    <AeroRadio value="voice" border>语音消息</AeroRadio>
    <AeroRadio value="video" border>视频消息</AeroRadio>
  </AeroRadioGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const type = ref('text')
</script>
```

## 按钮样式

使用 `AeroRadioButton` 替代 `AeroRadio` 呈现按钮外观；在 `AeroRadioGroup` 上通过 `fill` 与 `textColor` 自定义选中态背景色与文字色。

```vue
<template>
  <AeroRadioGroup v-model="pay">
    <AeroRadioButton value="alipay">支付宝</AeroRadioButton>
    <AeroRadioButton value="wechat">微信支付</AeroRadioButton>
    <AeroRadioButton value="card">银行卡</AeroRadioButton>
  </AeroRadioGroup>
  <AeroRadioGroup
    v-model="pay2"
    fill="#7c3aed"
    text-color="#ffffff"
    style="margin-top: 12px"
  >
    <AeroRadioButton value="alipay">支付宝</AeroRadioButton>
    <AeroRadioButton value="wechat">微信支付</AeroRadioButton>
    <AeroRadioButton value="card">银行卡</AeroRadioButton>
  </AeroRadioGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const pay = ref('alipay')
const pay2 = ref('wechat')
</script>
```

## 表单集成

置于 `AeroForm`/`AeroFormItem` 内时，自动继承表单/表单项级 `size`/`disabled`，并在选中值变化时触发字段即时校验。

```vue
<template>
  <AeroForm ref="formRef" :model="form" :rules="rules" label-width="80px">
    <AeroFormItem label="性别" prop="gender">
      <AeroRadioGroup v-model="form.gender">
        <AeroRadio value="male">男</AeroRadio>
        <AeroRadio value="female">女</AeroRadio>
      </AeroRadioGroup>
    </AeroFormItem>
    <AeroFormItem>
      <AeroButton type="primary" @click="submit">提交</AeroButton>
    </AeroFormItem>
  </AeroForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({ gender: '' })

const rules = {
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
}

function submit() {
  formRef.value.validate().catch(() => {})
}
</script>
```

## Radio API

### Radio Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| value | 选项值（选中时写入绑定值；缺省回退 label） | `string \| number \| boolean` | — |
| label | 选项值（兼容别名，语义同 value） @deprecated | `string \| number \| boolean` | — |
| modelValue | 绑定值（独立使用时生效；位于 RadioGroup 内时以组绑定值优先） | `string \| number \| boolean` | — |
| disabled | 是否禁用该选项（组内时与组禁用叠加） | `boolean` | `false` |
| border | 是否显示外边框 | `boolean` | `false` |
| size | 尺寸（border 或按钮样式下生效；缺省继承组/表单级 size） | `'large' \| 'main' \| 'small'` | `'main'` |
| name | 原生 radio 的 name 属性（同组使用相同 name 支持键盘导航） | `string` | — |

### RadioGroup Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| modelValue | 组绑定值：组内至多一个选项与之匹配呈选中态 | `string \| number \| boolean` | — |
| size | 组内所有子选项的尺寸（子项自身 size 优先） | `'large' \| 'main' \| 'small'` | `'main'` |
| disabled | 是否禁用组内所有子选项 | `boolean` | `false` |
| fill | 按钮样式子项选中态的背景色 | `string` | — |
| textColor | 按钮样式子项选中态的文字色 | `string` | — |
| name | 透传给组内所有子选项原生 radio 的 name 属性 | `string` | — |
| validateEvent | 值变化时是否触发表单校验 | `boolean` | `true` |
| label | 原生 aria-label（无障碍标签） | `string` | — |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| update:modelValue | 绑定值更新时触发 | `(value: string \| number \| boolean)` |
| change | 选中值变化时触发（点击已选中项不触发） | 同上 |
