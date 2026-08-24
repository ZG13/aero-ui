# Requirements Document

## Introduction

本规范（i18n）的目标是重建 `aero-ui` 组件库的国际化机制：基于 `vue-i18n` 提供 `zh-cn` / `en` 两套语言包、统一的 locale 注册入口与切换入口（`useLocale`），供组件内置文案（如无障碍描述、占位符默认值）与下游消费者复用。本规范只搭建机制与语言包骨架，不实现任何具体组件的文案全量翻译，也不提供运行时语言切换 UI。

## Boundary Context (Optional)

- **In scope**：`vue-i18n` 集成（作为 external 依赖，不打入产物）、`zh-cn` / `en` 语言包结构与文件、locale 注册入口（`packages/locale/index.ts`）、locale 切换入口（`useLocale` hook）、语言包类型契约。
- **Out of scope**：具体组件文案的全量翻译（仅搭机制）、运行时语言切换 UI、组件实现、主题、resolver、AI 文档。
- **Adjacent expectations**：`foundation` 提供构建契约、路径别名（`aero-ui/*`）与 exports 映射，供本 spec 的 `packages/locale/` 与 `packages/hooks/useLocale.ts` 复用；`core-components` 作为下游通过 `useLocale` 消费 locale 机制并补充具体组件文案。

## Requirements

### Requirement 1: 语言包结构
**Objective:** As a 组件库维护者，I want `zh-cn` 与 `en` 两套独立语言包，so that 组件内置文案与消费者可按需复用。

#### Acceptance Criteria
1.1 The locale 系统 shall 支持 `zh-cn` 与 `en` 两种语言标识。

1.2 The locale 系统 shall 为每种语言提供独立语言包文件（`zh-cn` / `en`），可被独立引用与按需加载。

1.3 The locale 系统 shall 提供类型安全语言包契约（`LanguagePack`），使语言包结构可被类型检查。

### Requirement 2: vue-i18n 集成与注册入口
**Objective:** As a 组件库维护者，I want 基于 `vue-i18n` 的统一 i18n 实例与注册入口，so that 全库文案翻译有单一机制。

#### Acceptance Criteria
2.1 The locale 系统 shall 基于 `vue-i18n` 创建全局 i18n 实例，并作为统一注册入口暴露。

2.2 The locale 系统 shall 以 `zh-cn` 作为默认语言。

2.3 When 组件库构建时，the 构建管线 shall 将 `vue-i18n` 作为 external 依赖处理，不打包进产物。

2.4 The locale 系统 shall 暴露语言包与默认语言的公开导出入口。

### Requirement 3: locale 获取与切换（useLocale）
**Objective:** As a 组件开发者，I want 通过 hook 获取当前语言与翻译函数并切换语言，so that 组件可获取内置文案。

#### Acceptance Criteria
3.1 The locale 系统 shall 提供 `useLocale` hook，返回当前语言与翻译函数 `t`。

3.2 When 开发者切换当前语言，the 翻译函数 `t` shall 返回新语言下的文案。

3.3 If 请求的文案 key 在当前语言包中缺失，the 翻译函数 `t` shall 回退到默认语言或返回 key 本身，而不抛错。

### Requirement 4: 边界与依赖约束
**Objective:** As a 组件库维护者，I want 明确本 spec 的范围边界，so that locale 机制不与组件文案/UI/主题/resolver 耦合。

#### Acceptance Criteria
4.1 The locale 系统 shall 不实现任何具体组件文案的全量翻译（仅搭机制）。

4.2 The locale 系统 shall 不实现运行时语言切换 UI。

4.3 The locale 系统 shall 不依赖组件、主题、resolver 等下游领域。
