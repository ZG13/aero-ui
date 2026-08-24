<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watchEffect } from 'vue'
import * as Vue from 'vue'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { useData } from 'vitepress'

// Live demo 块：接收 markdown 侧传入的 base64 编码 SFC 源码，运行时编译并渲染。
// `source` 为源码、`html` 为 shiki 高亮后的 HTML，均在 config.mts 的 fence 规则里
// 用 UTF-8 → base64 编码，避免多行内容经 HTML 属性传递时的转义问题。

const props = defineProps<{ source: string; html: string }>()

const { lang } = useData()

// —— base64 → UTF-8 解码
function decodeSource(base64: string): string {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

const rawSource = computed(() => decodeSource(props.source))
const highlightedHtml = computed(() => decodeSource(props.html))

// —— 运行时编译：parse → compileScript → compileTemplate → 组件选项。
// 编译产物里的 `import ... from 'vue'` 改写为从 `__vue__`（Vue 命名空间）解构，
// 再用 new Function 执行，得到可在当前 app 上下文渲染的组件选项。
function stripVueImports(code: string): string {
  return code
    // import { a as b, c } from 'vue'  →  const { a: b, c } = __vue__
    .replace(/import\s*\{([^}]*)\}\s*from\s*['"]vue['"];?/g, (_m, names: string) => {
      const mapped = names
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/\s+as\s+/g, ': '))
        .join(', ')
      return `const { ${mapped} } = __vue__`
    })
    // import Foo from 'vue'  →  const Foo = __vue__
    .replace(/import\s+([A-Za-z_$][\w$]*)\s+from\s*['"]vue['"];?/g, (_m, name: string) => `const ${name} = __vue__`)
}

function compileDemo(source: string): Record<string, unknown> {
  const id = 'aero-demo'
  const { descriptor, errors } = parse(source, { filename: `${id}.vue` })
  if (errors.length) throw new Error(errors.map((e) => e.message ?? String(e)).join('\n'))

  if (!descriptor.template) throw new Error('demo 缺少 <template>')

  const hasScript = Boolean(descriptor.scriptSetup || descriptor.script)
  let options: Record<string, unknown> = {}
  let bindingMetadata: Record<string, unknown> = {}

  if (hasScript) {
    const script = compileScript(descriptor, { id })
    const scriptBody = stripVueImports(script.content).replace(/export\s+default\s+/, 'return ')
    // eslint-disable-next-line no-new-func
    options = new Function('__vue__', scriptBody)(Vue) as Record<string, unknown>
    bindingMetadata = (script.bindings ?? {}) as Record<string, unknown>
  }

  const render = compileTemplate({
    id,
    source: descriptor.template.content,
    filename: `${id}.vue`,
    compilerOptions: { bindingMetadata },
  })
  if (render.errors.length) throw new Error(render.errors.map((e) => e.message ?? String(e)).join('\n'))

  const renderBody = `${stripVueImports(render.code)}\nreturn render`
  // eslint-disable-next-line no-new-func
  options.render = new Function('__vue__', renderBody.replace(/\bexport\s+function\s+render\b/, 'function render'))(Vue)
  options.__name = id
  return options
}

const demo = shallowRef<Record<string, unknown> | null>(null)
const error = shallowRef<string | null>(null)
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

watchEffect(() => {
  demo.value = null
  error.value = null
  // 仅在客户端编译渲染，避免 SSR 阶段执行 new Function / atob 带来的不确定性。
  if (!mounted.value) return
  try {
    demo.value = compileDemo(rawSource.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
})

const showCode = ref(false)
const codeToggleLabel = computed(() => {
  const zh = lang.value === 'zh-CN'
  if (showCode.value) return zh ? '隐藏代码' : 'Hide code'
  return zh ? '显示代码' : 'Show code'
})
</script>

<template>
  <div class="demo-block">
    <div class="demo-block__stage">
      <component :is="demo" v-if="demo" />
      <div v-else-if="error" class="demo-block__error">{{ error }}</div>
    </div>
    <div class="demo-block__bar">
      <button type="button" class="demo-block__toggle" @click="showCode = !showCode">
        {{ codeToggleLabel }}
      </button>
    </div>
    <div v-show="showCode" class="demo-block__source">
      <!-- shiki 高亮后的 HTML，样式与明暗配色见全局 style.css（v-html 注入内容无 scope 属性） -->
      <div class="demo-block__code" v-html="highlightedHtml" />
    </div>
  </div>
</template>

<style scoped>
.demo-block {
  margin: var(--aero-space-6, 16px) 0;
  border: 1px solid var(--aero-border-main, #ebebeb);
  border-radius: var(--aero-radius-main, 8px);
  overflow: hidden;
}

.demo-block__stage {
  padding: var(--aero-space-10, 24px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--aero-space-4, 12px);
}

.demo-block__error {
  color: var(--aero-danger-6, #dc2626);
  font-family: var(--aero-font-family-english, monospace);
  font-size: 12px;
  white-space: pre-wrap;
}

.demo-block__bar {
  display: flex;
  justify-content: flex-end;
  padding: var(--aero-space-2, 4px) var(--aero-space-4, 12px);
  border-top: 1px solid var(--aero-border-main, #ebebeb);
}

.demo-block__toggle {
  border: none;
  background: transparent;
  color: var(--aero-text-secondary, #858585);
  font-size: 13px;
  cursor: pointer;
  padding: var(--aero-space-2, 4px) var(--aero-space-3, 8px);
  border-radius: var(--aero-radius-small, 4px);
}

.demo-block__toggle:hover {
  color: var(--aero-primary-6, #3b82f6);
}

.demo-block__source {
  border-top: 1px solid var(--aero-border-main, #ebebeb);
}
</style>
