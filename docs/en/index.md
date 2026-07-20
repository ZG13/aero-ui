---
layout: home

hero:
  name: ep-craft
  text: Enterprise Vue 3 Component Library
  tagline: Type-first · Tree-shakable · Dark mode · i18n
  actions:
    - theme: brand
      text: Getting Started
      link: /en/guide/getting-started
    - theme: alt
      text: Components
      link: /en/components/button

features:
  - title: Type-first
    details: Every component is declared with defineProps<T>() generics and exported interfaces, giving precise IDE type hints.
  - title: Tree-shakable
    details: preserveModules keeps the module structure on build; EpCraftResolver auto-imports components and their styles.
  - title: Theme & i18n
    details: Two-level design tokens with dark mode, built-in useLocale / useTheme, Chinese / English switching.
---
