import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
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
    <ActivityIndicator color="rgba(255, 255, 255, 0.4)" size="large" />
  </View>
);
