/** 受支持语言标识 —— 全库语言枚举的唯一收敛点 */
export type Locale = 'zh-cn' | 'en';

/**
 * 语言包契约。
 * `name` 标识语言自身名称；开放命名空间索引预留组件文案扩展（core-components 后续补充）。
 */
export interface LanguagePack {
  /** 语言自身名称，用于展示与调试 */
  name: string;
  /** 预留：组件文案命名空间，具体 key 由 core-components 补充 */
  [namespace: string]: string | string[] | Record<string, unknown>;
}
