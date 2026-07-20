import type { ComponentResolver } from 'unplugin-vue-components/types';

export interface EpCraftResolverOptions {
  /** 是否同时自动引入组件样式 @default true */
  importStyle?: boolean;
}

/**
 * unplugin-vue-components 的按需引入 Resolver。
 * 匹配 Ep 前缀组件（如 EpButton），自动从子路径导入组件与样式。
 */
export function EpCraftResolver(options: EpCraftResolverOptions = {}): ComponentResolver {
  const { importStyle = true } = options;

  return {
    type: 'component',
    resolve: (name: string) => {
      if (!name.startsWith('Ep')) return;

      // EpButton -> button
      const partialName = name.slice(2);
      const kebab = partialName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

      return {
        name,
        from: `ep-craft/components/${kebab}`,
        sideEffects: importStyle ? `ep-craft/components/${kebab}/style/index.css` : undefined,
      };
    },
  };
}

export default EpCraftResolver;
