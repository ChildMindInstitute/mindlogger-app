import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import LottieView from 'lottie-react-native';
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
  Actions.popTo('applet_details');
};

const ActivityThanks = () => (
  <View style={styles.box}>
    <View style={{ alignItems: 'center' }}>
      <Heading>Thanks!</Heading>
      <BodyText>We've saved your data</BodyText>
    </View>
    <LottieView source={require('../../animations/4054-smoothymon-clap.json')} autoPlay style={{ width: 200 }} />
    <Button onPress={onPressStart} full rounded style={{ marginTop: 20 }}>
      <Text style={{ color: 'white' }}>Close</Text>
    </Button>
  </View>
);

export default ActivityThanks;
