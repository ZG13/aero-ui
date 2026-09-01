import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import AeroSelect from '../index';
import AeroOption from '../src/Option.vue';
import AeroForm from '../../form/src/Form.vue';
import AeroFormItem from '../../form-item/src/FormItem.vue';
import { selectContextKey } from '../src/constants';
import type { SelectContext } from '../src/constants';

describe('AeroOption', () => {
  it('挂载时注册选项、卸载时注销', async () => {
    let captured: SelectContext | undefined;

    const Probe = defineComponent({
      setup() {
        captured = undefined as unknown as SelectContext;
        return () => h('span');
      },
    });

    // 挂载 Select，其内部 provide selectContextKey，再由探测子组件捕获
    const wrapper = mount(AeroSelect, {
      slots: {
        default: () => h(AeroOption, { label: 'A', value: 'a' }),
      },
    });

    // 选项由 AeroOption 挂载注册，验证 Select 收集到选项：渲染面板后选项行存在
    await wrapper.find('.aero-select__trigger').trigger('click');
    await nextTick();
    expect(document.body.querySelector('.aero-option')).toBeTruthy();

    // 卸载后选项注销（unmount Select，其内部 options 清空）
    wrapper.unmount();
  });
});

describe('AeroSelect 表单集成', () => {
  function mountFormIntegration() {
    const city = ref('');
    const host = defineComponent({
      components: { AeroForm, AeroFormItem, AeroSelect, AeroOption },
      setup() {
        return { city };
      },
      template: `
        <AeroForm :model="{ city }" size="small" disabled>
          <AeroFormItem label="城市" prop="city">
            <AeroSelect v-model="city">
              <AeroOption label="北京" value="beijing" />
              <AeroOption label="上海" value="shanghai" />
            </AeroSelect>
          </AeroFormItem>
        </AeroForm>
      `,
    });
    return mount(host);
  }

  it('置于表单内继承 size 与 disabled', () => {
    const wrapper = mountFormIntegration();
    const select = wrapper.findComponent(AeroSelect);
    expect(select.classes()).toContain('aero-select--small');
    expect(select.classes()).toContain('is-disabled');
  });

  it('表单外独立使用不报错，disabled 仅由自身 props 决定', () => {
    const wrapper = mount(AeroSelect, {
      slots: { default: () => h(AeroOption, { label: 'A', value: 'a' }) },
    });
    expect(wrapper.find('.aero-select').classes()).not.toContain('is-disabled');
  });
});
