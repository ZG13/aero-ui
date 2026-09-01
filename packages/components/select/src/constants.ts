import type { InjectionKey } from 'vue';

/** 选项值类型（与 SelectProps.modelValue 对齐） */
export type SelectValue = string | number;

/** 注册进 selectContext 的选项快照（label/value/disabled） */
export interface SelectOption {
  label: SelectValue;
  value: SelectValue;
  disabled: boolean;
}

/**
 * AeroSelect 通过 `provide` 下发给 AeroOption 的上下文。
 *
 * AeroOption 仅负责注册/注销自身数据（label/value/disabled），由 AeroSelect
 * 统一渲染下拉面板的选项行（含选中态、禁用态、过滤）。父子通过此 key 解耦，
 * Option 不直接依赖 Select 实例。
 */
export interface SelectContext {
  /** 注册选项 */
  addOption: (option: SelectOption) => void;
  /** 注销选项 */
  removeOption: (option: SelectOption) => void;
}

/** 选项上下文注入 key（Symbol，避免字符串 key 冲突） */
export const selectContextKey: InjectionKey<SelectContext> =
  Symbol('selectContextKey');
