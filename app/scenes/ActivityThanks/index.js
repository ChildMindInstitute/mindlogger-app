import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

const styles = StyleSheet.create({
  box: {
    padding: 20,
    paddingTop: 40,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

const onPressStart = () => {
  Actions.replace('applet_details');
};

const ActivityThanks = () => (
  <View style={styles.box}>
    <Heading>Thanks!</Heading>
    <BodyText>
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
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
    </Button>
  </View>
);

export default ActivityThanks;
