import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  body: {
    fontWeight: 'normal',
    fontSize: 15,
    color: colors.tertiary,
  },
});

export const BodyText = ({ children }) => (
  <Text style={styles.body}>
    {children}
  </Text>
);

BodyText.propTypes = {
  children: PropTypes.node.isRequired,
};
