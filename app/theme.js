import * as themes from './themes'
import baseTheme from './themes/baseTheme'
import {StyleSheet} from 'react-native';
console.log(themes.default['lightTheme'])
console.log({
  ...baseTheme,
  ...themes['lightTheme']
})
const styles = StyleSheet.create({
  ...baseTheme,
  ...themes.default['lightTheme']
});
export default styles
