# Button 按钮

常用的操作按钮。

## 基础用法

使用 `type` 指定按钮类型。

<div class="ep-demo-block">
  <EpButton type="primary">Primary</EpButton>
  <EpButton type="success">Success</EpButton>
  <EpButton type="info">Info</EpButton>
  <EpButton type="warning">Warning</EpButton>
  <EpButton type="danger">Danger</EpButton>
</div>

```vue
<EpButton type="primary">Primary</EpButton>
<EpButton type="success">Success</EpButton>
<EpButton type="info">Info</EpButton>
<EpButton type="warning">Warning</EpButton>
<EpButton type="danger">Danger</EpButton>
```

## 视觉样式

使用 `variant` 指定实心 `solid`、描边 `plain` 或无底 `none`。

<div class="ep-demo-block">
  <EpButton type="primary" variant="solid">Solid</EpButton>
  <EpButton type="primary" variant="plain">Plain</EpButton>
  <EpButton type="primary" variant="none">None</EpButton>
</div>

```vue
<EpButton type="primary" variant="solid">Solid</EpButton>
<EpButton type="primary" variant="plain">Plain</EpButton>
<EpButton type="primary" variant="none">None</EpButton>
```

## 尺寸

使用 `size` 指定 `mini` / `small` / `middle` / `large`。

<div class="ep-demo-block">
  <EpButton type="primary" size="large">Large</EpButton>
  <EpButton type="primary" size="middle">Middle</EpButton>
  <EpButton type="primary" size="small">Small</EpButton>
  <EpButton type="primary" size="mini">Mini</EpButton>
</div>

```vue
<EpButton type="primary" size="large">Large</EpButton>
<EpButton type="primary" size="middle">Middle</EpButton>
<EpButton type="primary" size="small">Small</EpButton>
<EpButton type="primary" size="mini">Mini</EpButton>
```

## 圆角

通过 `round` 设置圆角按钮。

<div class="ep-demo-block">
  <EpButton type="primary" round>Round</EpButton>
  <EpButton type="success" round>Round</EpButton>
</div>

```vue
<EpButton type="primary" round>Round</EpButton>
```

## 禁用与加载

通过 `disabled` 与 `loading` 控制状态。

<div class="ep-demo-block">
  <EpButton type="primary" disabled>Disabled</EpButton>
  <EpButton type="primary" loading>Loading</EpButton>
</div>

```vue
<EpButton type="primary" disabled>Disabled</EpButton>
<EpButton type="primary" loading>Loading</EpButton>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 按钮类型 | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'info'` | `'primary'` |
| size | 按钮尺寸 | `'mini' \| 'small' \| 'middle' \| 'large'` | `'middle'` |
| variant | 视觉样式 | `'solid' \| 'plain' \| 'none'` | `'solid'` |
| round | 是否圆角 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| icon | 左侧图标名 | `string` | — |
| suffixIcon | 右侧图标名 | `string` | — |
| nativeType | 原生 button type | `'button' \| 'submit' \| 'reset'` | `'button'` |

### Events

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| click | 点击按钮时触发（禁用/加载中不触发） | `(event: MouseEvent)` |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 按钮内容 |
