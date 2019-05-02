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

export const Heading = ({ children, style = {} }) => (
  <Text style={{ ...styles.heading, ...style }}>
    {children}
  </Text>
);

Heading.defaultProps = {
  style: {},
};

Heading.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
