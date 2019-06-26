import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import LottieView from 'lottie-react-native';
import {
  Heading,
} from '../../components/core';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default () => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" />
    {/* <ActivityIndicator color="rgba(255, 255, 255, 0.4)" size="large" /> */}
    <Heading style={{ color: 'white', paddingBottom: 20 }}>Loading MindLogger</Heading>
    <LottieView source={require('../../animations/hamster-run.json')} style={{ width: 100 }} autoPlay />
  </View>
);
