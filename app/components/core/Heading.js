import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  heading: {
    fontWeight: 'bold',
    fontSize: 24,
    color: colors.tertiary,
  },
});

export const Heading = ({ children }) => (
  <Text style={styles.heading}>
    {children}
  </Text>
);

Heading.propTypes = {
  children: PropTypes.node.isRequired,
};
