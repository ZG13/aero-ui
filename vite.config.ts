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
      entry: fileURLToPath(new URL('./packages/index.ts', import.meta.url)),
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
