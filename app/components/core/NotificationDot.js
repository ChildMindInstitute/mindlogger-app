import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.alert,
    width: 20,
    height: 20,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginLeft: 12,
    marginTop: 6,
    borderRadius: 10,
    elevation: 2,
    position: 'absolute',
  },
});

export const NotificationDot = () => (
  <View style={styles.container} />
);
