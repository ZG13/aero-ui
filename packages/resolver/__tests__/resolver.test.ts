import { describe, expect, it } from 'vitest';
import { AeroResolver } from '../index';

function resolve(name: string, importStyle = true) {
  const resolvers = AeroResolver({ importStyle });
  const resolver = resolvers[0];
  if (!resolver || typeof resolver === 'function')
    throw new Error('expected ComponentResolverObject');
  return resolver.resolve(name);
}

describe('AeroResolver', () => {
  it('AeroButton 映射到 aero-ui/components/button', () => {
    expect(resolve('AeroButton')).toEqual({
      name: 'AeroButton',
      from: 'aero-ui/components/button',
      sideEffects: 'aero-ui/components/button/style/index.css',
    });
  });

  it('PascalCase 转 kebab-case（AeroDatePicker → date-picker）', () => {
    const r = resolve('AeroDatePicker') as { from: string };
    expect(r.from).toBe('aero-ui/components/date-picker');
  });

  it('非 Aero 前缀返回空结果（RouterView / ElButton / Aerospace）', () => {
    expect(resolve('RouterView')).toBeUndefined();
    expect(resolve('ElButton')).toBeUndefined();
    expect(resolve('Aerospace')).toBeUndefined();
  });

  it('importStyle: false 时不附带样式 side effect', () => {
    const r = resolve('AeroButton', false) as { from: string; sideEffects?: string };
    expect(r.sideEffects).toBeUndefined();
    expect(r.from).toBe('aero-ui/components/button');
  });

  it('返回值形态符合 unplugin-vue-components resolver 契约', () => {
    const resolvers = AeroResolver();
    expect(Array.isArray(resolvers)).toBe(true);
    expect(resolvers).toHaveLength(1);
    expect(resolvers[0]).toHaveProperty('type', 'component');
    expect(resolvers[0]).toHaveProperty('resolve');
  });
});
