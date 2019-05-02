import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.alert,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7,
    elevation: 1,
  },
});

export const NotificationDot = () => (
  <View style={styles.container} />
);
