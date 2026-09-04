// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///D:/work/project/self/aero-ui/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.43_sass@1.102.0/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/work/project/self/aero-ui/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vi_b304f84b901d559ead903cc04a8644f6/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import dts from "file:///D:/work/project/self/aero-ui/node_modules/.pnpm/vite-plugin-dts@3.9.1_@type_67c4d25e00bfca0eca6e8bf8b2053149/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///D:/work/project/self/aero-ui/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: "packages",
      outDir: "dist/types",
      include: ["packages/**/*.ts", "packages/**/*.vue"],
      exclude: ["packages/**/__tests__/**"]
    })
  ],
  build: {
    target: "es2018",
    cssCodeSplit: true,
    lib: {
      // 多入口：根 barrel（components + locale 经其可达）之外，
      // resolver 与 hooks barrel 不在根 barrel 图中，需显式列为入口。
      // entry 键带子路径，使 entryFileNames 的 [name] 落到 resolver/index、hooks/index。
      entry: {
        index: fileURLToPath(new URL("./packages/index.ts", __vite_injected_original_import_meta_url)),
        "resolver/index": fileURLToPath(new URL("./packages/resolver/index.ts", __vite_injected_original_import_meta_url)),
        "hooks/index": fileURLToPath(new URL("./packages/hooks/index.ts", __vite_injected_original_import_meta_url))
      },
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: ["vue", "@vueuse/core", "vue-i18n", "dayjs"],
      output: [
        {
          format: "es",
          dir: "dist/es",
          entryFileNames: "[name].mjs",
          preserveModules: true,
          preserveModulesRoot: "packages",
          globals: { vue: "Vue" }
        },
        {
          format: "cjs",
          dir: "dist/lib",
          entryFileNames: "[name].cjs",
          exports: "named",
          preserveModules: true,
          preserveModulesRoot: "packages",
          globals: { vue: "Vue" }
        }
      ]
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    passWithNoTests: true,
    include: ["packages/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/components/**/*.{ts,vue}"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3JrXFxcXHByb2plY3RcXFxcc2VsZlxcXFxhZXJvLXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3b3JrXFxcXHByb2plY3RcXFxcc2VsZlxcXFxhZXJvLXVpXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93b3JrL3Byb2plY3Qvc2VsZi9hZXJvLXVpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICBkdHMoe1xuICAgICAgZW50cnlSb290OiAncGFja2FnZXMnLFxuICAgICAgb3V0RGlyOiAnZGlzdC90eXBlcycsXG4gICAgICBpbmNsdWRlOiBbJ3BhY2thZ2VzLyoqLyoudHMnLCAncGFja2FnZXMvKiovKi52dWUnXSxcbiAgICAgIGV4Y2x1ZGU6IFsncGFja2FnZXMvKiovX190ZXN0c19fLyoqJ10sXG4gICAgfSksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXMyMDE4JyxcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgbGliOiB7XG4gICAgICAvLyBcdTU5MUFcdTUxNjVcdTUzRTNcdUZGMUFcdTY4MzkgYmFycmVsXHVGRjA4Y29tcG9uZW50cyArIGxvY2FsZSBcdTdFQ0ZcdTUxNzZcdTUzRUZcdThGQkVcdUZGMDlcdTRFNEJcdTU5MTZcdUZGMENcbiAgICAgIC8vIHJlc29sdmVyIFx1NEUwRSBob29rcyBiYXJyZWwgXHU0RTBEXHU1NzI4XHU2ODM5IGJhcnJlbCBcdTU2RkVcdTRFMkRcdUZGMENcdTk3MDBcdTY2M0VcdTVGMEZcdTUyMTdcdTRFM0FcdTUxNjVcdTUzRTNcdTMwMDJcbiAgICAgIC8vIGVudHJ5IFx1OTUyRVx1NUUyNlx1NUI1MFx1OERFRlx1NUY4NFx1RkYwQ1x1NEY3RiBlbnRyeUZpbGVOYW1lcyBcdTc2ODQgW25hbWVdIFx1ODQzRFx1NTIzMCByZXNvbHZlci9pbmRleFx1MzAwMWhvb2tzL2luZGV4XHUzMDAyXG4gICAgICBlbnRyeToge1xuICAgICAgICBpbmRleDogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3BhY2thZ2VzL2luZGV4LnRzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgICdyZXNvbHZlci9pbmRleCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9wYWNrYWdlcy9yZXNvbHZlci9pbmRleC50cycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgICAnaG9va3MvaW5kZXgnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vcGFja2FnZXMvaG9va3MvaW5kZXgudHMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgIH0sXG4gICAgICBmb3JtYXRzOiBbJ2VzJywgJ2NqcyddLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsndnVlJywgJ0B2dWV1c2UvY29yZScsICd2dWUtaTE4bicsICdkYXlqcyddLFxuICAgICAgb3V0cHV0OiBbXG4gICAgICAgIHtcbiAgICAgICAgICBmb3JtYXQ6ICdlcycsXG4gICAgICAgICAgZGlyOiAnZGlzdC9lcycsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdbbmFtZV0ubWpzJyxcbiAgICAgICAgICBwcmVzZXJ2ZU1vZHVsZXM6IHRydWUsXG4gICAgICAgICAgcHJlc2VydmVNb2R1bGVzUm9vdDogJ3BhY2thZ2VzJyxcbiAgICAgICAgICBnbG9iYWxzOiB7IHZ1ZTogJ1Z1ZScgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZvcm1hdDogJ2NqcycsXG4gICAgICAgICAgZGlyOiAnZGlzdC9saWInLFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnW25hbWVdLmNqcycsXG4gICAgICAgICAgZXhwb3J0czogJ25hbWVkJyxcbiAgICAgICAgICBwcmVzZXJ2ZU1vZHVsZXM6IHRydWUsXG4gICAgICAgICAgcHJlc2VydmVNb2R1bGVzUm9vdDogJ3BhY2thZ2VzJyxcbiAgICAgICAgICBnbG9iYWxzOiB7IHZ1ZTogJ1Z1ZScgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgfSxcbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgcGFzc1dpdGhOb1Rlc3RzOiB0cnVlLFxuICAgIGluY2x1ZGU6IFsncGFja2FnZXMvKiovX190ZXN0c19fLyoqLyoudGVzdC50cyddLFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICBwcm92aWRlcjogJ3Y4JyxcbiAgICAgIGluY2x1ZGU6IFsncGFja2FnZXMvY29tcG9uZW50cy8qKi8qLnt0cyx2dWV9J10sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnUixTQUFTLGVBQWUsV0FBVztBQUNuVCxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxTQUFTO0FBSHlKLElBQU0sMkNBQTJDO0FBSzFOLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxNQUNGLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLFNBQVMsQ0FBQyxvQkFBb0IsbUJBQW1CO0FBQUEsTUFDakQsU0FBUyxDQUFDLDBCQUEwQjtBQUFBLElBQ3RDLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsSUFDZCxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJSCxPQUFPO0FBQUEsUUFDTCxPQUFPLGNBQWMsSUFBSSxJQUFJLHVCQUF1Qix3Q0FBZSxDQUFDO0FBQUEsUUFDcEUsa0JBQWtCLGNBQWMsSUFBSSxJQUFJLGdDQUFnQyx3Q0FBZSxDQUFDO0FBQUEsUUFDeEYsZUFBZSxjQUFjLElBQUksSUFBSSw2QkFBNkIsd0NBQWUsQ0FBQztBQUFBLE1BQ3BGO0FBQUEsTUFDQSxTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsSUFDdkI7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxPQUFPLGdCQUFnQixZQUFZLE9BQU87QUFBQSxNQUNyRCxRQUFRO0FBQUEsUUFDTjtBQUFBLFVBQ0UsUUFBUTtBQUFBLFVBQ1IsS0FBSztBQUFBLFVBQ0wsZ0JBQWdCO0FBQUEsVUFDaEIsaUJBQWlCO0FBQUEsVUFDakIscUJBQXFCO0FBQUEsVUFDckIsU0FBUyxFQUFFLEtBQUssTUFBTTtBQUFBLFFBQ3hCO0FBQUEsUUFDQTtBQUFBLFVBQ0UsUUFBUTtBQUFBLFVBQ1IsS0FBSztBQUFBLFVBQ0wsZ0JBQWdCO0FBQUEsVUFDaEIsU0FBUztBQUFBLFVBQ1QsaUJBQWlCO0FBQUEsVUFDakIscUJBQXFCO0FBQUEsVUFDckIsU0FBUyxFQUFFLEtBQUssTUFBTTtBQUFBLFFBQ3hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixpQkFBaUI7QUFBQSxJQUNqQixTQUFTLENBQUMsb0NBQW9DO0FBQUEsSUFDOUMsVUFBVTtBQUFBLE1BQ1IsVUFBVTtBQUFBLE1BQ1YsU0FBUyxDQUFDLG1DQUFtQztBQUFBLElBQy9DO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
