import { computed, inject } from 'vue';
import type { ComputedRef } from 'vue';
import { formContextKey, formItemContextKey } from './constants';
import type { FormSize } from '../types';

/**
 * 解析控件尺寸。
 *
 * 优先级：自身 `initialSize` → 表单项级 `formItemContext.size` → 表单级
 * `formContext.size` → `undefined`。可在表单/表单项上下文之外安全调用，
 * 此时 `inject` 返回 `undefined` 并回退到自身/默认值。
 */
export function useFormSize(
  initialSize?: FormSize,
): ComputedRef<FormSize | undefined> {
  const formContext = inject(formContextKey, undefined);
  const formItemContext = inject(formItemContextKey, undefined);

  return computed(
    () => initialSize ?? formItemContext?.size ?? formContext?.size ?? undefined,
  );
}

/**
 * 解析控件禁用态。
 *
 * 优先级：自身 `initialDisabled` → 表单项级 `formItemContext.disabled` → 表单级
 * `formContext.disabled` → `false`。可在表单/表单项上下文之外安全调用。
 */
export function useFormDisabled(initialDisabled?: boolean): ComputedRef<boolean> {
  const formContext = inject(formContextKey, undefined);
  const formItemContext = inject(formItemContextKey, undefined);

  return computed(
    () =>
      initialDisabled ??
      formItemContext?.disabled ??
      formContext?.disabled ??
      false,
  );
}
