import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import AeroButton from 'aero-ui/components/button'
import AeroInput from 'aero-ui/components/input'
import AeroIcon from 'aero-ui/components/icon'
import 'aero-ui/theme/index.scss'
import 'aero-ui/components/button/style/index.scss'
import 'aero-ui/components/input/style/index.scss'
import 'aero-ui/components/icon/style/index.scss'
import ThemeSwitch from './ThemeSwitch.vue'
import DemoBlock from './DemoBlock.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(AeroButton)
    app.use(AeroInput)
    app.use(AeroIcon)
    app.component('DemoBlock', DemoBlock)
  },
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(ThemeSwitch)
    })
}
