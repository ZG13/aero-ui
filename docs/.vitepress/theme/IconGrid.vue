<script setup lang="ts">
import { ref } from 'vue';
import { useData } from 'vitepress';
import AeroIcon from 'aero-ui/components/icon';

// element-plus 风格的图标网格：图标 + 名称，hover 高亮，点击复制名称。
const { lang } = useData();

const icons = [
  { name: 'search', label: '搜索' },
  { name: 'close', label: '关闭' },
  { name: 'loading', label: '加载中' },
  { name: 'settings', label: '设置' },
  { name: 'link', label: '链接' },
];

const copied = ref<string | null>(null);

const copiedText = () => (lang.value === 'zh-CN' ? '已复制' : 'Copied');

async function copy(name: string) {
  try {
    await navigator.clipboard.writeText(name);
    copied.value = name;
    setTimeout(() => {
      if (copied.value === name) copied.value = null;
    }, 1500);
  } catch {
    // 剪贴板不可用（非安全上下文等）时静默忽略
  }
}
</script>

<template>
  <ul class="aero-icon-grid">
    <li
      v-for="icon in icons"
      :key="icon.name"
      class="aero-icon-grid__item"
      :title="icon.label"
      @click="copy(icon.name)"
    >
      <AeroIcon :name="icon.name" :size="24" color="currentColor" />
      <span class="aero-icon-grid__name">
        {{ copied === icon.name ? copiedText() : icon.name }}
      </span>
    </li>
  </ul>
</template>

<style scoped>
.aero-icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: var(--aero-space-4, 12px);
  margin: var(--aero-space-4, 12px) 0;
  padding: 0;
  list-style: none;
}

.aero-icon-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
  gap: var(--aero-space-3, 8px);
  padding: var(--aero-space-6, 16px) var(--aero-space-3, 8px);
  border: 1px solid var(--aero-border-main, #ebebeb);
  border-radius: var(--aero-radius-main, 8px);
  color: var(--aero-neutral-10, #1d1f29);
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s,
    background-color 0.2s;
}

.aero-icon-grid__item:hover {
  border-color: var(--aero-primary-6, #1c64fd);
  color: var(--aero-primary-6, #1c64fd);
}

.aero-icon-grid__name {
  font-size: 12px;
  line-height: 1;
  user-select: none;
}
</style>
