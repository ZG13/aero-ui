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
  },
} satisfies LanguagePack;

export default zhCn;
