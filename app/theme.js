import { StyleSheet } from 'react-native';
import * as themes from './themes';
import baseTheme from './themes/baseTheme';

export * from './themes/colors';

const styles = StyleSheet.create({
  ...baseTheme,
  ...themes.default.lightTheme,
});

export default styles;
