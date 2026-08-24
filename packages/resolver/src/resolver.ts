import type { ComponentInfo, ComponentResolver } from 'unplugin-vue-components';
import type { ResolverOptions } from '../types';

/**
 * PascalCase → kebab-case。
 * 规则：小写字母/数字后跟大写、连续大写后跟小写 处插入连字符。
 */
function kebabCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** 是否匹配 Aero 前缀组件（Aero 后必须紧跟大写字母，排除 Aerospace 等误匹配） */
function isAeroComponent(name: string): boolean {
  return /^Aero[A-Z]/.test(name);
}

/**
 * AeroResolver 工厂：将 `<AeroXxx />` 映射到 `aero-ui/components/{x}`，
 * 并按需附带组件样式 side effect（`importStyle` 默认开启）。
 * 非 Aero 前缀组件返回空结果，交由其它 resolver / 插件默认行为处理。
 */
export function AeroResolver(options: ResolverOptions = {}): ComponentResolver[] {
  const { importStyle = true } = options;

  const resolver: ComponentResolver = {
    type: 'component',
    resolve(name: string): ComponentInfo | undefined {
      if (!isAeroComponent(name)) return undefined;

      const dir = kebabCase(name.slice('Aero'.length));
      const result: ComponentInfo = {
        name,
        from: `aero-ui/components/${dir}`,
      };
      if (importStyle) {
        result.sideEffects = `aero-ui/components/${dir}/style/index.css`;
      }
      return result;
    },
  };

  return [resolver];
}
