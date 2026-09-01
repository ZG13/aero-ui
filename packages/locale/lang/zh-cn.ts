import type { LanguagePack } from '../types';

const zhCn = {
  name: '中文',
  components: {
    button: {
      loading: '加载中',
    },
    input: {
      placeholder: '请输入',
    },
    select: {
      placeholder: '请选择',
      empty: '无匹配选项',
    },
    form: {
      rules: {
        required: '该字段为必填项',
        min: '不能小于 {min}',
        max: '不能大于 {max}',
        len: '长度必须为 {len}',
        pattern: '格式不正确',
        type: '类型不正确',
        enum: '值不在允许范围内',
        whitespace: '不能为空',
        default: '校验失败',
      },
    },
  },
} satisfies LanguagePack;

export default zhCn;
