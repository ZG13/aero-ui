import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import AeroButton from 'aero-ui/components/button'
import AeroInput from 'aero-ui/components/input'
import AeroIcon from 'aero-ui/components/icon'
import AeroForm from 'aero-ui/components/form'
import AeroFormItem from 'aero-ui/components/form-item'
import AeroSelect, { AeroOption } from 'aero-ui/components/select'
import AeroInputNumber from 'aero-ui/components/input-number'
import AeroDatePicker from 'aero-ui/components/date-picker'
import 'aero-ui/theme/index.scss'
import 'aero-ui/components/button/style/index.scss'
import 'aero-ui/components/input/style/index.scss'
import 'aero-ui/components/icon/style/index.scss'
import 'aero-ui/components/form/style/index.scss'
import 'aero-ui/components/form-item/style/index.scss'
import 'aero-ui/components/select/style/index.scss'
import 'aero-ui/components/input-number/style/index.scss'
import 'aero-ui/components/date-picker/style/index.scss'
import ThemeSwitch from './ThemeSwitch.vue'
import DemoBlock from './DemoBlock.vue'
import IconGrid from './IconGrid.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(AeroButton)
    app.use(AeroInput)
    app.use(AeroIcon)
    app.use(AeroForm)
    app.use(AeroFormItem)
    app.use(AeroSelect)
    app.use(AeroOption)
    app.use(AeroInputNumber)
    app.use(AeroDatePicker)
    app.component('DemoBlock', DemoBlock)
    app.component('IconGrid', IconGrid)
  },
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(ThemeSwitch)
    })
}
