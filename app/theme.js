import * as themes from './themes'
import baseTheme from './themes/baseTheme'
export default {
  ...baseTheme,
  ...themes['lightTheme']
}
