// aero-ui 库根入口（root barrel）
//
// foundation 阶段仅为占位空导出；构建入口由 vite.config.ts 的 build.lib.entry 固定为当前文件。
// 根 barrel 的 re-export 内容（组件 barrel、theme index、locale index 与 AeroUI 默认导出 install）
// 归 core-components spec 拥有，foundation 不填充，避免两个 spec 争用本文件。
export {};
