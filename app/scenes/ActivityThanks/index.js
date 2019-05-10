import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
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
  Actions.applet_details();
};

const ActivityThanks = () => (
  <View style={styles.box}>
    <Heading>Thanks!</Heading>
    <BodyText>
      We've saved your answers!
    </BodyText>
    <Button onPress={onPressStart} full rounded style={{ marginTop: 20 }}>
      <Text style={{ color: 'white' }}>Close</Text>
    </Button>
  </View>
);

export default ActivityThanks;
