import React from 'react';
import { ImageBackground, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Actions } from 'react-native-router-flux';
import {
  BodyText,
  Heading,
} from '../../components/core';
import theme from '../../themes/base-theme';
import FunButton from '../../components/core/FunButton';

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
      uri: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80',
    }}
  >
    <View style={styles.box}>
      <Heading style={{ fontFamily: theme.fontFamily }}>Thanks!</Heading>
      <BodyText style={{ fontFamily: theme.fontFamily }}>
        We've saved your answers!
      </BodyText>

      <FunButton onPress={onPressStart}>
        Close
      </FunButton>

    </View>
  </ImageBackground>
);

export default ActivityThanks;
