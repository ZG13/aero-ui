import type { LanguagePack } from '../types';

const en = {
  name: 'English',
  components: {
    button: {
      loading: 'Loading',
    },
    input: {
      placeholder: 'Please enter',
    },
  },
} satisfies LanguagePack;

export default en;
