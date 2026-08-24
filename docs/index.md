---
layout: home
redirect: /zh-CN/
---

<script setup>
import { useRouter } from 'vitepress'
import { onMounted } from 'vue'
const router = useRouter()
onMounted(() => router.go('/zh-CN/'))
</script>
