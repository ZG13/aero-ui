<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 明暗主题切换器，同时驱动两层配色：
// 1. `.aero-theme-light` / `.aero-theme-dark` —— 组件库语义 token（--aero-*），
//    是消费者在真实项目里使用 aero-ui 时会切换的根类，文档里如实演示这一契约；
// 2. `.dark` —— VitePress 站点外壳（--vp-*：背景/文字/侧边栏等）的暗色开关。
//    仅切 .aero-theme-* 时 --vp-* 保持亮色，整页看起来"没切换"，故需同步切换 .dark。
const THEME_LIGHT = 'aero-theme-light'
const THEME_DARK = 'aero-theme-dark'

const isDark = ref(false)

function applyTheme(dark: boolean) {
  const root = document.documentElement
  root.classList.toggle(THEME_DARK, dark)
  root.classList.toggle(THEME_LIGHT, !dark)
  // VitePress 站点表面配色由 .dark 驱动（appearance: false 已禁用其自动切换，此处手动接管）
  root.classList.toggle('dark', dark)
}

function toggle() {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
}

onMounted(() => {
  // 默认 light，与 :root 默认一致
  applyTheme(false)
})
</script>

<template>
  <button class="aero-theme-switch" type="button" :aria-label="isDark ? '切换为亮色' : '切换为暗色'" @click="toggle">
    <span v-if="isDark">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>
