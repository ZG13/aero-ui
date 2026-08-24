# Technology Stack

## Architecture

A single-package Vue 3 component library (no multi-package publish). Source lives under `packages/`, grouped by domain, compiled by Vite library mode into dual formats with generated type declarations. Docs are a VitePress site mirrored in Chinese and English.

## Core Technologies

- **Language**: TypeScript (strict mode, `~5.4`)
- **Framework**: Vue 3.4 (`<script setup lang="ts">`)
- **Build**: Vite 5 library mode + `vite-plugin-dts`
- **Styles**: SCSS (`.scss`), consumed via CSS variables
- **Package manager**: pnpm (workspace), Node `>=18`

## Key Libraries

- **@vueuse/core** — composable utilities (externalized at build).
- **vue-i18n** — internationalization runtime.
- **unplugin-vue-components** — consumer-side auto-import, paired with `AeroResolver`.
- **vitest + @vue/test-utils + jsdom** — unit testing with v8 coverage.
- **VitePress** — documentation site.

## Development Standards

### Component Authoring
Components use `<script setup lang="ts">` + `defineProps<T>()` (with `withDefaults`), `defineEmits<T>()`. The `Options API` / `export default { props }` form is forbidden. Props/interfaces live in a sibling `types.ts`, never inline.

### Design System
Components may **only** use semantic `--aero-*` variables (`--aero-primary-6`, `--aero-text-main`, `--aero-radius-main`, …). Hard-coded colors/spacing and direct palette references (`--aero-blue-6`) are forbidden. Theme switching uses `.aero-theme-light` / `.aero-theme-dark` — never `.dark`.

### Type Safety
`strict: true`; no `any`. Component interfaces exported from `types.ts` with JSDoc `@default` annotations.

### Code Quality
ESLint 8 (`.eslintrc.cjs`) + `@typescript-eslint` + `eslint-plugin-vue`; Prettier 3 (`.prettierrc.json`). Format target: `packages/**/*.{ts,vue,scss}`.

### Testing
Vitest with `jsdom`, globals enabled, colocated `__tests__/*.test.ts` per component. Coverage provider `v8`, scoped to `packages/components/**`.

## Development Environment

### Required Tools
- Node `>=18.0.0`, pnpm `>=8.0.0`

### Common Commands
```bash
# Dev:  pnpm docs:dev        # VitePress docs site
# Build: pnpm build           # vite build (ESM + CJS + types)
# Test:  pnpm test            # vitest run
# Type:  pnpm typecheck       # vue-tsc --noEmit
# Lint:  pnpm lint / pnpm format
```

## Key Technical Decisions

- **Dual-format build** — ESM (`dist/es`) and CJS (`dist/lib`) with `preserveModules: true`, plus `.d.ts` via `vite-plugin-dts`. Rationale: support both modern bundlers and legacy `require` consumers while keeping tree-shaking.
- **`aero-ui` path alias** — maps `aero-ui` → `packages/index.ts` and `aero-ui/*` → `packages/*`, so source imports mirror the published specifier.
- **Semantic token layer** — a single indirection (`--aero-*`) isolates components from raw palette; theming and rebranding are variable-only changes.
- **Runtime deps externalized** — `vue`, `@vueuse/core`, `vue-i18n` are `external` in Rollup so the library never bundles Vue.

---
_Document standards and patterns, not every dependency_
