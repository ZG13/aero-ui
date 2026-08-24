# Product Overview

**aero-ui** is an enterprise-grade Vue 3 web component library. It ships reusable UI primitives backed by a semantic design-token system, so downstream apps build consistent interfaces with light/dark theming out of the box. It is deliberately **AI-friendly**: deterministic conventions plus a curated `AI_CONTEXT.md` let AI agents (Claude Code / Figma MCP) generate correct component code without guesswork.

## Core Capabilities

- **Reusable UI components** exposed with the `Aero` prefix (e.g. `AeroButton`), each supporting full/spec/global-registration import modes.
- **Semantic design tokens** — a `--aero-*` CSS variable layer (colors, radius, typography, spacing) that components consume exclusively; no hard-coded values.
- **Theming** — light/dark modes switched via `.aero-theme-light` / `.aero-theme-dark` root classes.
- **Internationalization** — built-in locale support (`zh-cn`, `en`) via `vue-i18n`.
- **On-demand import** — an `unplugin-vue-components` resolver (`AeroResolver`) so consumers write `<AeroButton />` without manual registration.

## Target Use Cases

- Internal and commercial web apps that need a consistent, branded component set.
- Teams requiring both Chinese and English UI copy from a single library.
- Consumers who want tree-shakeable on-demand imports rather than a full-bundle global install.
- AI-assisted development, where an agent can read `AI_CONTEXT.md` and generate convention-correct code.

## Value Proposition

A typed, themable, i18n-ready, AI-friendly Vue 3 component library where the design system lives *inside* the package. Components are forced onto the semantic token layer (never raw palette values), so brand changes and dark-mode support propagate to every component without per-component edits — and an agent can produce correct code from a single documented contract.

---
_Focus on patterns and purpose, not exhaustive feature lists_
