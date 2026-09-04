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
    select: {
      placeholder: 'Please select',
      empty: 'No matching options',
    },
    datePicker: {
      datePlaceholder: 'Select date',
      startPlaceholder: 'Start date',
      endPlaceholder: 'End date',
      today: 'Today',
      year: 'Year',
      month: 'Month',
      weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    },
    form: {
      rules: {
        required: 'This field is required',
        min: 'Must be at least {min}',
        max: 'Must be at most {max}',
        len: 'Length must be {len}',
        pattern: 'Format is invalid',
        type: 'Type is invalid',
        enum: 'Value is not in the allowed range',
        whitespace: 'Must not be empty',
        default: 'Validation failed',
      },
    },
  },
} satisfies LanguagePack;

export default en;
