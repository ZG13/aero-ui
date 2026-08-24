# Brief: i18n

## Problem

组件库需要国际化，默认支持中文与英文两套文案，供组件内部文案与消费者复用。

## Current State

- 上一版已有 `packages/locale/` + `lang/{zh-cn,en}.ts` + vue-i18n 依赖（可参照）。
- 当前仓库为空，无任何 locale 代码。

## Desired Outcome

- 基于 vue-i18n 的 locale 系统，`packages/locale/` 提供 zh-cn / en 两套字典与注册入口。
- 组件可通过 locale 机制获取内置文案（如无障碍描述、占位符默认值）。

## Approach

重建 `packages/locale/`（vue-i18n 集成 + 语言包 + `useLocale` 相关 hook），语言包独立文件、按需加载。仅搭好机制，具体文案由组件补充。

## Scope

- **In**: vue-i18n 集成、zh-cn/en 语言包结构、locale 注册与切换入口。
- **Out**: 具体组件文案全量翻译、运行时语言切换 UI。

## Boundary Candidates

- locale 机制（集成 + 切换）
- 语言包内容（zh-cn / en）

## Out of Boundary

- 组件实现、主题、resolver、AI 文档。

## Upstream / Downstream

- **Upstream**: foundation。
- **Downstream**: core-components（组件消费 locale）。

## Existing Spec Touchpoints

- **Extends**: 无。
- **Adjacent**: core-components。

## Constraints

- 依赖 vue-i18n（external，不打入产物）。
