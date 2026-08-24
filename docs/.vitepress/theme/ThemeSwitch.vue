<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 明暗主题切换器：仅在根 <html> 元素上切 .aero-theme-light / .aero-theme-dark，
// 绝不写 .dark（VitePress 默认外观已通过 appearance: false 禁用）。
const THEME_LIGHT = 'aero-theme-light'
const THEME_DARK = 'aero-theme-dark'

const isDark = ref(false)

function applyTheme(dark: boolean) {
  const root = document.documentElement
  root.classList.toggle(THEME_DARK, dark)
  root.classList.toggle(THEME_LIGHT, !dark)
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
