import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  subHeading: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 5,
    color: colors.tertiary,
  },
});

export const LittleHeading = ({ children, style }) => (
  <Text style={[styles.subHeading, style]}>
    {children}
  </Text>
);

LittleHeading.defaultProps = {
  style: {},
};

LittleHeading.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};
