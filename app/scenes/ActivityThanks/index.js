import React from 'react';
import { ImageBackground, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Svg, {
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import {
  BodyText,
  Heading,
} from '../../components/core';
import theme from '../../themes/base-theme';

const styles = StyleSheet.create({
  box: {
    padding: 20,
    paddingTop: 40,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'white',
    fontFamily: theme.fontFamily,
  },
});

const onPressStart = () => {
  Actions.replace('applet_details');
};

const ActivityThanks = () => (
  <ImageBackground
    style={{ width: '100%', height: '100%', flex: 1 }}
    source={{
      uri: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80'
    }}
  >
    <View style={styles.box}>
      <Heading style={{ fontFamily: theme.fontFamily }}>Thanks!</Heading>
      <BodyText style={{ fontFamily: theme.fontFamily }}>
        We've saved your answers!
      </BodyText>

      <Button onPress={onPressStart} full rounded transparent style={{ marginTop: 20 }}>
        <Svg width={Math.round(Dimensions.get('window').width * 0.9)} height={40} style={{ position: 'absolute' }}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2={Math.round(Dimensions.get('window').width * 0.9)} y2={50}>
              <Stop offset="0" stopColor="#24A3FF" stopOpacity="1" />
              <Stop offset="1" stopColor="#35FDB5" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect id="rect1" x="0" y="0" rx="20" ry="20" width={Math.round(Dimensions.get('window').width * 0.9)} height={40} fill="url(#grad)"/>
        </Svg>
        <Text style={{ color: 'white', fontWeight: 'bold', fontFamily: theme.fontFamily }}>Close</Text>
      </Button>
    </View>
  </ImageBackground>
);

export default ActivityThanks;
