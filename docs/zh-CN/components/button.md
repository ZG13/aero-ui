# Button 按钮

常用的操作按钮。

## 基础用法

使用 `type` 设置语义类型。

```vue
<template>
  <AeroButton type="primary">主要按钮</AeroButton>
  <AeroButton type="success">成功按钮</AeroButton>
  <AeroButton type="warning">警告按钮</AeroButton>
  <AeroButton type="danger">危险按钮</AeroButton>
  <AeroButton type="info">中性按钮</AeroButton>
</template>
```

## 样式

`variant` 支持 `solid`（实底）、`plain`（描边）、`none`（纯文本）。

```vue
<template>
  <AeroButton type="primary" variant="solid">实底按钮</AeroButton>
  <AeroButton type="primary" variant="plain">描边按钮</AeroButton>
  <AeroButton type="primary" variant="none">文字按钮</AeroButton>
</template>
```

## 尺寸

通过 `size` 控制按钮尺寸，支持 `large`（36px）、`default`（32px）、`small`（28px）、`mini`（24px）。

```vue
<template>
  <AeroButton size="large">大按钮</AeroButton>
  <AeroButton size="default">默认按钮</AeroButton>
  <AeroButton size="small">小按钮</AeroButton>
  <AeroButton size="mini">迷你按钮</AeroButton>
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

通过 `icon` 传入图标名（经 `AeroIcon` 渲染），`iconPosition` 控制图标位置（`left` / `right`）。

```vue
<template>
  <AeroButton icon="search">搜索</AeroButton>
  <AeroButton icon="search" iconPosition="right">搜索</AeroButton>
  <AeroButton icon="search" />
</template>
```

## API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| type | 语义类型 | `'primary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` |
| variant | 按钮样式 | `'solid' \| 'plain' \| 'none'` | `'solid'` |
| size | 按钮尺寸 | `'large' \| 'default' \| 'small' \| 'mini'` | `'default'` |
| shape | 按钮形状 | `'default' \| 'round'` | `'default'` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| icon | 图标名（经 AeroIcon 渲染） | `string` | — |
| iconPosition | 图标位置 | `'left' \| 'right'` | `'left'` |
| nativeType | 原生按钮类型 | `'button' \| 'submit' \| 'reset'` | `'button'` |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| click | 点击时触发（禁用 / 加载中不触发） | `(event: MouseEvent)` |
