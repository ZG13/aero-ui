import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'packages',
      outDir: 'dist/types',
      include: ['packages/**/*.ts', 'packages/**/*.vue'],
      exclude: ['packages/**/__tests__/**'],
    }),
  ],
  build: {
    target: 'es2018',
    cssCodeSplit: true,
    lib: {
      // 多入口：根 barrel（components + locale 经其可达）之外，
      // resolver 与 hooks barrel 不在根 barrel 图中，需显式列为入口。
      // entry 键带子路径，使 entryFileNames 的 [name] 落到 resolver/index、hooks/index。
      entry: {
        index: fileURLToPath(new URL('./packages/index.ts', import.meta.url)),
        'resolver/index': fileURLToPath(new URL('./packages/resolver/index.ts', import.meta.url)),
        'hooks/index': fileURLToPath(new URL('./packages/hooks/index.ts', import.meta.url)),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core', 'vue-i18n'],
      output: [
        {
          format: 'es',
          dir: 'dist/es',
          entryFileNames: '[name].mjs',
          preserveModules: true,
          preserveModulesRoot: 'packages',
          globals: { vue: 'Vue' },
        },
        {
          format: 'cjs',
          dir: 'dist/lib',
          entryFileNames: '[name].cjs',
          exports: 'named',
          preserveModules: true,
          preserveModulesRoot: 'packages',
          globals: { vue: 'Vue' },
        },
      ],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    include: ['packages/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/components/**/*.{ts,vue}'],
    },
  },
});
