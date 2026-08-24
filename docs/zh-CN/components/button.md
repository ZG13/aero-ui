# Button 按钮

常用的操作按钮。

## 基础用法

使用 `type`、`size` 设置按钮的类型与尺寸。

```vue
<template>
  <AeroButton type="primary">主要按钮</AeroButton>
  <AeroButton>默认按钮</AeroButton>
  <AeroButton type="danger">危险按钮</AeroButton>
  <AeroButton type="link">链接按钮</AeroButton>
</template>
```

## 尺寸

通过 `size` 控制按钮尺寸，支持 `large`、`main`、`small`。

```vue
<template>
  <AeroButton size="large">大按钮</AeroButton>
  <AeroButton size="main">中按钮</AeroButton>
  <AeroButton size="small">小按钮</AeroButton>
</template>
```

## 禁用与加载

`disabled` 禁用按钮，`loading` 展示加载态；两者均不触发 `click`。

```vue
<template>
  <AeroButton disabled>禁用按钮</AeroButton>
  <AeroButton loading>加载中</AeroButton>
</template>
```

## 图标按钮

通过 `icon` 传入图标名，经 `AeroIcon` 渲染。

```vue
<template>
  <AeroButton icon="search">搜索</AeroButton>
  <AeroButton icon="search" />
</template>
```

## API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| type | 按钮类型 | `'primary' \| 'default' \| 'danger' \| 'link'` | `'default'` |
| size | 按钮尺寸 | `'large' \| 'main' \| 'small'` | `'main'` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| icon | 图标名（经 AeroIcon 渲染） | `string` | — |
| nativeType | 原生按钮类型 | `'button' \| 'submit' \| 'reset'` | `'button'` |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| click | 点击时触发（禁用 / 加载中不触发） | `(event: MouseEvent)` |
