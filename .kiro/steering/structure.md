# Project Structure

## Organization Philosophy

Domain-grouped source under a single `packages/` root (not feature-first per component, not nested workspaces). Each domain — components, hooks, locale, theme, resolver — is a top-level directory that mirrors how the library is consumed. Components are self-contained folders carrying their implementation, styles, types, and tests together.

## Directory Patterns

### Components
**Location**: `packages/components/`
**Purpose**: Every published component, one folder per component.
**Example**:
```
packages/components/button/           # 文件夹 kebab-case，对齐发布 specifier aero-ui/components/button
  index.ts          # export AeroButton (with install) + re-export types
  src/Button.vue    # <script setup lang="ts"> implementation（.vue 文件 PascalCase）
  style/index.scss  # BEM classes + --aero-* token usage
  types.ts          # Props/Emits interfaces (JSDoc @default)
  __tests__/Button.test.ts
```

### Hooks
**Location**: `packages/hooks/`
**Purpose**: Shared composables (e.g. `useLocale.ts`). 明暗切换为纯 CSS 根类（`.aero-theme-*`），无运行时 `useTheme` hook。

### Locale
**Location**: `packages/locale/`
**Purpose**: i18n dictionaries, one file per language (`lang/zh-cn.ts`, `lang/en.ts`).

### Theme
**Location**: `packages/theme/`
**Purpose**: Design tokens. `base/` holds primitive tokens (`color`, `number`, `radius`, `font`, `stroke`, …); `light.scss` / `dark.scss` bind semantic `--aero-*` variables per mode; `index.scss` is the theme entry.

### Resolver
**Location**: `packages/resolver/`
**Purpose**: The `unplugin-vue-components` resolver (`AeroResolver`) for on-demand import.

### Docs
**Location**: `docs/`
**Purpose**: VitePress site, 中英双语镜像（`docs/zh-CN/` 与 `docs/en-US/`，VitePress locales）。

## Naming Conventions

- **Folders**: `kebab-case`（组件目录 `button/`、`input/`、`icon/`）。
- **Files**: `PascalCase.vue` for component implementations, `kebab-case` for config, `camelCase.ts` for composables/types (`useLocale.ts`).
- **Components**: PascalCase, exported with `Aero` prefix (`AeroButton`), DOM class `aero-*`.
- **Classes (DOM)**: BEM — `aero-button__loading`, state modifiers `is-loading` / `is-disabled` / `is-icon-only`.
- **CSS variables**: `--aero-{semantic}-{scale}` (e.g. `--aero-primary-6`, `--aero-text-main`).

## Import Organization

```typescript
// Absolute (via package alias — mirrors the published specifier)
import { AeroButton } from 'aero-ui';
import AeroButton from 'aero-ui/components/button';

// Relative (within a component folder)
import type { ButtonProps } from '../types';
```

**Path Aliases** (from `tsconfig.json`):
- `aero-ui` → `packages/index.ts`
- `aero-ui/*` → `packages/*`

## Code Organization Principles

- **One component = one folder** carrying code, styles, types, and tests — a component is never a single loose `.vue` file.
- **No business logic in components** — shared logic is extracted to `packages/hooks/`.
- **Types are a public contract** — every component exports its `Props`/`Emits` from `types.ts`; consumers depend on these, so they carry full JSDoc.
- **Theming never leaks into components** — styles read `--aero-*` tokens; light/dark mapping lives only in `packages/theme/`.

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
