<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from 'vue';
import AeroIcon from '../../icon';
import { useLocale } from '../../../hooks';
import { useFormSize, useFormDisabled } from '../../form/src/use-form';
import { formItemContextKey } from '../../form/src/constants';
import { selectContextKey } from './constants';
import type { SelectContext, SelectOption, SelectValue } from './constants';
import type { SelectProps, SelectEmits } from '../types';

defineOptions({ name: 'AeroSelect' });

// disabled 显式默认 undefined：绕过 Vue 布尔 prop 的「未声明 → false」强转，
// 交由 useFormDisabled 按「自身 → 表单项 → 表单 → 默认」解析（对齐 AeroInput）。
const props = withDefaults(defineProps<SelectProps>(), {
  disabled: undefined,
  multiple: false,
  clearable: false,
  filterable: false,
});

const emit = defineEmits<SelectEmits>();

const { t } = useLocale();

// —— 表单上下文集成 ——
const formItemContext = inject(formItemContextKey, undefined);
const inheritedSize = useFormSize(props.size);
const inheritedDisabled = useFormDisabled(props.disabled);

const size = computed(() => inheritedSize.value ?? 'main');
const disabled = computed(() => inheritedDisabled.value);

const placeholder = computed(
  () => props.placeholder ?? t('components.select.placeholder'),
);

// —— 选中值 ——
const selectedValues = computed<SelectValue[]>(() => {
  if (!props.multiple) return [];
  return (props.modelValue as SelectValue[] | undefined) ?? [];
});

const selectedValue = computed<SelectValue | undefined>(() =>
  props.multiple ? undefined : (props.modelValue as SelectValue | undefined),
);

const hasValue = computed(() =>
  props.multiple
    ? selectedValues.value.length > 0
    : selectedValue.value !== undefined &&
      selectedValue.value !== null &&
      selectedValue.value !== '',
);

// 浮动占位：有值或展开时 placeholder 上浮吸附到上边框（对齐 AeroInput floating）
const isFloat = computed(() => hasValue.value || open.value);

// —— 选项注册（AeroOption 挂载/卸载时维护） ——
const options = ref<SelectOption[]>([]);

function addOption(option: SelectOption): void {
  options.value.push(option);
}

function removeOption(option: SelectOption): void {
  const index = options.value.indexOf(option);
  if (index !== -1) options.value.splice(index, 1);
}

const context: SelectContext = reactive({
  addOption,
  removeOption,
});

provide(selectContextKey, context);

// —— 回显 ——
function labelOf(value: SelectValue): SelectValue {
  const matched = options.value.find((option) => option.value === value);
  return matched ? matched.label : value;
}

const displayValue = computed(() => {
  if (props.multiple) return '';
  if (selectedValue.value === undefined || selectedValue.value === '') return '';
  return labelOf(selectedValue.value);
});

// —— 面板与选项列表 ——
const open = ref(false);

const filterQuery = ref('');

const filteredOptions = computed<SelectOption[]>(() => {
  if (!props.filterable) return options.value;
  const query = filterQuery.value.trim().toLowerCase();
  if (!query) return options.value;
  return options.value.filter((option) =>
    String(option.label).toLowerCase().includes(query),
  );
});

// filterable 输入框显示值：过滤词优先；单选无过滤词时回显选中 label；多选回退空。
const filterDisplay = computed(() => {
  if (filterQuery.value) return filterQuery.value;
  if (!props.multiple && selectedValue.value !== undefined && selectedValue.value !== '') {
    return String(labelOf(selectedValue.value));
  }
  return '';
});

function onFilterInput(event: Event): void {
  filterQuery.value = (event.target as HTMLInputElement).value;
}

function onFilterFocus(event: FocusEvent): void {
  // 聚焦时展开面板并全选，便于输入直接覆盖当前回显/过滤词
  openPanel();
  (event.target as HTMLInputElement).select();
}

function isSelected(value: SelectValue): boolean {
  if (props.multiple) return selectedValues.value.includes(value);
  return selectedValue.value === value;
}

function isOptionDisabled(option: SelectOption): boolean {
  return option.disabled;
}

function select(value: SelectValue): void {
  if (props.multiple) {
    const next = selectedValues.value.includes(value)
      ? selectedValues.value.filter((v) => v !== value)
      : [...selectedValues.value, value];
    emit('update:modelValue', next);
    emit('change', next);
  } else {
    emit('update:modelValue', value);
    emit('change', value);
    close();
  }
}

// —— 键盘导航（对齐 element-plus：↑/↓ 移动高亮、Enter 选中、Esc/Tab 收起） ——
const activeIndex = ref(-1);

function resolveActiveIndex(): number {
  const list = filteredOptions.value;
  const selected = list.findIndex((o) => isSelected(o.value));
  if (selected >= 0) return selected;
  const firstEnabled = list.findIndex((o) => !o.disabled);
  return firstEnabled;
}

function moveActiveIndex(delta: number): void {
  const list = filteredOptions.value;
  const count = list.length;
  if (!count) return;
  let next = activeIndex.value;
  // 环绕移动并跳过 disabled 选项
  for (let step = 0; step < count; step += 1) {
    next = (next + delta + count) % count;
    if (!list[next].disabled) break;
  }
  activeIndex.value = next;
  scrollActiveIntoView();
}

function scrollActiveIntoView(): void {
  nextTick(() => {
    const active = panelRef.value?.querySelector<HTMLElement>('.aero-option.is-active');
    active?.scrollIntoView?.({ block: 'nearest' });
  });
}

function handleKeydown(event: KeyboardEvent): void {
  if (disabled.value) return;
  // 收起态：↓/Enter 展开（element-plus 行为）
  if (!open.value) {
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      event.preventDefault();
      openPanel();
    }
    return;
  }
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveActiveIndex(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveActiveIndex(-1);
      break;
    case 'Enter':
      event.preventDefault();
      if (activeIndex.value >= 0) {
        const option = filteredOptions.value[activeIndex.value];
        if (option && !option.disabled) select(option.value);
      }
      break;
    case 'Escape':
      event.preventDefault();
      close();
      break;
    case 'Tab':
      close();
      break;
  }
}

// —— 展开 / 收起 ——
function toggle(): void {
  if (disabled.value) return;
  if (open.value) {
    close();
  } else {
    openPanel();
  }
}

function openPanel(): void {
  if (disabled.value) return;
  open.value = true;
  updatePanelPosition();
  activeIndex.value = resolveActiveIndex();
  scrollActiveIntoView();
}

function close(): void {
  open.value = false;
  filterQuery.value = '';
  activeIndex.value = -1;
  formItemContext?.validate('change');
}

watch(open, (value) => {
  emit('visible-change', value);
});

// —— 清空 ——
// 清空入口：仅在聚焦或鼠标悬浮时展示（element-plus 行为），避免常态下占据视觉空间。
const focused = ref(false);
const hovering = ref(false);

const showClear = computed(
  () =>
    props.clearable &&
    !disabled.value &&
    hasValue.value &&
    (focused.value || hovering.value),
);

function clear(): void {
  if (props.multiple) {
    emit('update:modelValue', []);
    emit('change', []);
  } else {
    emit('update:modelValue', undefined);
    emit('change', undefined);
  }
  emit('clear');
}

// —— 多选标签删除 ——
function removeTag(value: SelectValue): void {
  const next = selectedValues.value.filter((v) => v !== value);
  emit('update:modelValue', next);
  emit('change', next);
}

// —— 点击外部关闭 ——
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

// —— 面板定位 ——
// 面板 Teleport 到 body，脱离触发器的定位上下文，需在打开时按触发器的
// getBoundingClientRect 手动计算定位（fixed + viewport 坐标）。
const panelStyle = ref<{ top: string; left: string; width: string }>({
  top: '0',
  left: '0',
  width: '0',
});

function updatePanelPosition(): void {
  if (!rootRef.value) return;
  const rect = rootRef.value.getBoundingClientRect();
  panelStyle.value = {
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
}

function handleDocumentClick(event: MouseEvent): void {
  if (!open.value) return;
  const target = event.target as Node;
  // 面板 Teleport 到 body，故需同时排除触发器与面板内部的点击
  if (rootRef.value && rootRef.value.contains(target)) return;
  if (panelRef.value && panelRef.value.contains(target)) return;
  close();
}

// 全局 Esc 兜底：焦点可能在面板/触发器之外的任意位置（键盘导航由触发器的
// handleKeydown 负责，此处仅兜底 Esc 收起）
function handleDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) {
    close();
  }
}

// 滚动 / 窗口 resize 时收起（面板 fixed 定位不随触发器滚动，需同步收起）
function handleViewportChange(event: Event): void {
  if (!open.value) return;
  // 面板自身 overflow-y 滚动不触发收起
  if (panelRef.value && panelRef.value.contains(event.target as Node)) return;
  close();
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true);
  document.addEventListener('keydown', handleDocumentKeydown);
  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('scroll', handleViewportChange, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick, true);
  document.removeEventListener('keydown', handleDocumentKeydown);
  window.removeEventListener('resize', handleViewportChange);
  window.removeEventListener('scroll', handleViewportChange, true);
});

// blur/change 时触发字段即时校验（fire-and-forget 副作用，对齐 AeroInput）
function handleBlur(): void {
  formItemContext?.validate('blur');
}
</script>

<template>
  <div
    ref="rootRef"
    class="aero-select"
    :class="[
      `aero-select--${size}`,
      {
        'is-disabled': disabled,
        'is-open': open,
        'is-multiple': multiple,
        'is-float': isFloat,
      },
    ]"
    role="combobox"
    aria-haspopup="listbox"
    :aria-expanded="open"
    :aria-disabled="disabled || undefined"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focusin="focused = true"
    @focusout="focused = false"
    @blur="handleBlur"
  >
    <div
      class="aero-select__trigger"
      tabindex="0"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <!-- 浮动占位 label：空态居中充当占位文案，有值/展开时上浮吸附到上边框 -->
      <span class="aero-select__label" aria-hidden="true">{{ placeholder }}</span>

      <!-- 可搜索态：单选/多选均渲染输入框，用 filterDisplay 作为显示值；
           原生 placeholder 交给浮动 label，这里置空仅保留可访问性语义 -->
      <input
        v-if="filterable"
        class="aero-select__filter"
        :value="filterDisplay"
        placeholder=""
        @input="onFilterInput"
        @focus="onFilterFocus"
        @click.stop
      />
      <template v-else>
        <span v-if="!multiple && hasValue" class="aero-select__value">
          {{ displayValue }}
        </span>
        <span v-else-if="multiple" class="aero-select__tags">
          <span
            v-for="value in selectedValues"
            :key="String(value)"
            class="aero-select__tag"
          >
            <span class="aero-select__tag-label">{{ labelOf(value) }}</span>
            <AeroIcon
              class="aero-select__tag-close"
              name="close"
              @click.stop="removeTag(value)"
            />
          </span>
        </span>
      </template>

      <AeroIcon
        v-if="showClear"
        class="aero-select__clear"
        name="close"
        :size="12"
        color="currentColor"
        @mousedown.prevent
        @click.stop="clear"
      />
      <span class="aero-select__arrow" aria-hidden="true"></span>
    </div>

    <Teleport to="body">
      <Transition name="aero-select">
        <div
          v-if="open"
          ref="panelRef"
          class="aero-select__panel"
          role="listbox"
          :style="panelStyle"
        >
          <div
            v-for="(option, index) in filteredOptions"
            :key="String(option.value)"
            class="aero-option"
            :class="{
              'is-selected': isSelected(option.value),
              'is-disabled': isOptionDisabled(option),
              'is-active': index === activeIndex,
            }"
            role="option"
            :aria-selected="isSelected(option.value)"
            :aria-disabled="isOptionDisabled(option) || undefined"
            @mouseenter="activeIndex = index"
            @click="!isOptionDisabled(option) && select(option.value)"
          >
            <span class="aero-option__label">{{ option.label }}</span>
          </div>
          <div v-if="filteredOptions.length === 0" class="aero-select__empty">
            {{ t('components.select.empty') }}
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 隐藏容器挂载 AeroOption 子组件，使其 onMounted 注册选项到 selectContext；
         选项行由本组件在面板中统一渲染，故此处仅作收集、不产生可见内容 -->
    <div class="aero-select__options-host" style="display: none">
      <slot />
    </div>
  </div>
</template>
