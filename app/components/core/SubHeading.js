import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import theme from '../../themes/base-theme';

const styles = StyleSheet.create({
  subHeading: {
    fontWeight: 'bold',
    fontFamily: theme.fontFamily,
    fontSize: 18,
    marginBottom: 8,
    color: colors.tertiary,
  },
});

export const SubHeading = ({ children, style }) => (
  <Text style={[styles.subHeading, style]}>
    {children}
  </Text>
);

SubHeading.defaultProps = {
  style: {},
};

SubHeading.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};
