import React from 'react';
import Svg, {
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Dimensions } from 'react-native';
import { Button, Text } from 'native-base';
import theme from '../../themes/base-theme';

// eslint-disable-next-line
export default ({ children, onPress }) => (
  <Button onPress={onPress} full rounded transparent style={{ marginTop: 20 }}>
    <Svg width={Math.round(Dimensions.get('window').width * 0.9)} height={40} style={{ position: 'absolute' }}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2={Math.round(Dimensions.get('window').width * 0.9)} y2={50}>
          <Stop offset="0" stopColor="#24A3FF" stopOpacity="1" />
          <Stop offset="1" stopColor="#35FDB5" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect id="rect1" x="0" y="0" rx="20" ry="20" width={Math.round(Dimensions.get('window').width * 0.9)} height={40} fill="url(#grad)"/>
    </Svg>
    <Text style={{ color: 'white', fontWeight: 'bold', fontFamily: theme.fontFamily }}>
      {children}
    </Text>
  </Button>
);
