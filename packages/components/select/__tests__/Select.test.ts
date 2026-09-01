import { describe, expect, it, afterEach } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import AeroSelect from '../index';
import AeroOption from '../src/Option.vue';

// 面板 Teleport 到 body，每个测试后自动 unmount 清理残留 DOM
enableAutoUnmount(afterEach);

function mountSelect(
  props: Record<string, unknown> = {},
  options: Array<{ label: string; value: string | number; disabled?: boolean }> = [],
) {
  return mount(AeroSelect, {
    props,
    slots: {
      default: () => options.map((o) => h(AeroOption, o)),
    },
  });
}

function panelOptions(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll('.aero-select__panel .aero-option'));
}

function panel(): HTMLElement | null {
  return document.body.querySelector('.aero-select__panel');
}

async function openPanel(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('.aero-select__trigger').trigger('click');
  await nextTick();
}

describe('AeroSelect', () => {
  it('空值展示占位文案', () => {
    const wrapper = mountSelect({ placeholder: '请选择' }, [
      { label: 'A', value: 'a' },
    ]);
    expect(wrapper.find('.aero-select__label').text()).toBe('请选择');
  });

  it('有值时占位 label 上浮到边框', async () => {
    const wrapper = mountSelect({ modelValue: 'b', placeholder: '请选择' }, [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
    ]);
    await nextTick();
    expect(wrapper.find('.aero-select').classes()).toContain('is-float');
  });

  it('有值时回显匹配选项的 label', async () => {
    const wrapper = mountSelect({ modelValue: 'b', placeholder: '请选择' }, [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
    ]);
    await nextTick();
    expect(wrapper.find('.aero-select__value').text()).toBe('Beta');
  });

  it('值无匹配 label 时回退展示 value 字符串', async () => {
    const wrapper = mountSelect({ modelValue: 'x' }, [
      { label: 'Alpha', value: 'a' },
    ]);
    await nextTick();
    expect(wrapper.find('.aero-select__value').text()).toBe('x');
  });

  it('单选：点击选项更新 modelValue 并派发 update:modelValue/change', async () => {
    const wrapper = mountSelect({}, [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
    ]);
    await openPanel(wrapper);
    await panelOptions()[1].click();
    await nextTick();

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['b']);
    expect(wrapper.emitted('change')!.at(-1)).toEqual(['b']);
  });

  it('单选：点击选项后收起面板并派发 visible-change', async () => {
    const wrapper = mountSelect({}, [{ label: 'A', value: 'a' }]);
    await openPanel(wrapper);
    await panelOptions()[0].click();
    await nextTick();

    expect(panel()).toBeNull();
    const visible = wrapper.emitted('visible-change')!;
    expect(visible.at(-1)).toEqual([false]);
  });

  it('clearable 有值时展示清空入口，点击清空并派发 clear', async () => {
    const wrapper = mountSelect({ modelValue: 'a', clearable: true }, [
      { label: 'Alpha', value: 'a' },
    ]);
    await nextTick();
    // 清空入口仅在聚焦或悬浮时展示
    expect(wrapper.find('.aero-select__clear').exists()).toBe(false);
    await wrapper.trigger('mouseenter');
    await nextTick();
    const clear = wrapper.find('.aero-select__clear');
    expect(clear.exists()).toBe(true);
    await clear.trigger('click');

    expect(wrapper.emitted('clear')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([undefined]);
  });

  it('clearable 无值时不展示清空入口', async () => {
    const wrapper = mountSelect({ clearable: true }, [
      { label: 'Alpha', value: 'a' },
    ]);
    await nextTick();
    expect(wrapper.find('.aero-select__clear').exists()).toBe(false);
  });

  it('多选：点击选项 toggle 加入/移出并派发数组', async () => {
    // 受控组件：需宿主回传新 modelValue，故用响应式 ref + v-model 绑定测试 toggle
    const value = ref<string[]>([]);
    const Host = defineComponent({
      components: { AeroSelect, AeroOption },
      setup() {
        return { value };
      },
      template: `
        <AeroSelect v-model="value" multiple>
          <AeroOption label="A" value="a" />
          <AeroOption label="B" value="b" />
        </AeroSelect>
      `,
    });
    const wrapper = mount(Host);
    await openPanel(wrapper);
    await panelOptions()[0].click();
    await nextTick();
    expect(value.value).toEqual(['a']);

    await panelOptions()[0].click();
    await nextTick();
    expect(value.value).toEqual([]);
  });

  it('多选：标签展示选中值并可通过删除入口移出', async () => {
    const wrapper = mountSelect({ multiple: true, modelValue: ['a', 'b'] }, [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
    ]);
    await nextTick();
    const tags = wrapper.findAll('.aero-select__tag');
    expect(tags).toHaveLength(2);
    expect(tags[0].text()).toContain('Alpha');

    await tags[0].find('.aero-select__tag-close').trigger('click');
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['b']]);
  });

  it('filterable：输入关键词本地过滤选项（大小写不敏感）', async () => {
    const wrapper = mountSelect({ multiple: true, filterable: true }, [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
      { label: 'Gamma', value: 'c' },
    ]);
    await openPanel(wrapper);
    await wrapper.find('.aero-select__filter').setValue('be');
    await nextTick();

    const labels = panelOptions().map((el) => el.textContent);
    expect(labels).toEqual(['Beta']);
  });

  it('filterable：单选态也渲染输入框并能过滤', async () => {
    const wrapper = mountSelect({ filterable: true, placeholder: '请选择' }, [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
    ]);
    const filter = wrapper.find('.aero-select__filter');
    expect(filter.exists()).toBe(true);

    await filter.trigger('focus');
    await nextTick();
    await filter.setValue('al');
    await nextTick();

    const labels = panelOptions().map((el) => el.textContent);
    expect(labels).toEqual(['Alpha']);
  });

  it('filterable：无匹配展示空态', async () => {
    const wrapper = mountSelect({ multiple: true, filterable: true }, [
      { label: 'Alpha', value: 'a' },
    ]);
    await openPanel(wrapper);
    await wrapper.find('.aero-select__filter').setValue('zzz');
    await nextTick();

    expect(document.body.querySelector('.aero-select__empty')).toBeTruthy();
  });

  it('选项 disabled 不可选中', async () => {
    const wrapper = mountSelect({}, [
      { label: 'A', value: 'a', disabled: true },
      { label: 'B', value: 'b' },
    ]);
    await openPanel(wrapper);
    expect(panelOptions()[0].classList).toContain('is-disabled');

    await panelOptions()[0].click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('打开时面板按触发器定位（top/left/width）', async () => {
    const wrapper = mountSelect({}, [{ label: 'A', value: 'a' }]);
    await openPanel(wrapper);

    const el = panel();
    expect(el).not.toBeNull();
    // 面板 Teleport 到 body，脱离触发器定位上下文，必须显式写入坐标，否则
    // 面板落在 body 底部不可见（「点击下拉框不展示下拉内容」的根因回归）
    expect(el!.style.top).not.toBe('');
    expect(el!.style.left).not.toBe('');
    expect(el!.style.width).not.toBe('');
  });

  it('整体 disabled 时不可展开', async () => {
    const wrapper = mountSelect({ disabled: true }, [
      { label: 'A', value: 'a' },
    ]);
    await wrapper.find('.aero-select__trigger').trigger('click');
    await nextTick();
    expect(panel()).toBeNull();
  });

  it('点击外部区域收起面板', async () => {
    const wrapper = mountSelect({}, [{ label: 'A', value: 'a' }]);
    await openPanel(wrapper);
    expect(panel()).not.toBeNull();

    document.body.click();
    await nextTick();
    expect(panel()).toBeNull();
  });

  it('Escape 键收起面板', async () => {
    const wrapper = mountSelect({}, [{ label: 'A', value: 'a' }]);
    await openPanel(wrapper);
    expect(panel()).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(panel()).toBeNull();
  });

  it('收起态按 ArrowDown 展开面板', async () => {
    const wrapper = mountSelect({}, [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
    ]);
    await wrapper.find('.aero-select__trigger').trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    expect(panel()).not.toBeNull();
  });

  it('展开态按 Enter 选中当前高亮选项', async () => {
    const wrapper = mountSelect({}, [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
    ]);
    await openPanel(wrapper);
    // 打开时高亮落到首个可选选项（Alpha）
    await wrapper.find('.aero-select__trigger').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.find('.aero-select__trigger').trigger('keydown', { key: 'Enter' });
    await nextTick();

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['b']);
    expect(panel()).toBeNull();
  });

  it('展开态 ArrowDown 环绕跳过 disabled 选项', async () => {
    const wrapper = mountSelect({}, [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b', disabled: true },
      { label: 'Gamma', value: 'c' },
    ]);
    await openPanel(wrapper);
    // 初始高亮 Alpha；下移应跳过 Beta 落到 Gamma
    await wrapper.find('.aero-select__trigger').trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    const active = panelOptions().find((el) => el.classList.contains('is-active'));
    expect(active?.textContent).toBe('Gamma');
  });
});
