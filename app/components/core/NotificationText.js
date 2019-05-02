import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.alert,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 1,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 12,
    color: colors.secondary,
  },
});

export const NotificationText = ({ children }) => (
  <View style={styles.container}>
    <Text style={styles.text}>
      {children}
    </Text>
  </View>
);

NotificationText.propTypes = {
  children: PropTypes.node.isRequired,
};
