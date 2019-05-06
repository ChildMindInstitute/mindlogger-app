import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  body: {
    fontWeight: 'normal',
    fontSize: 16,
    color: colors.tertiary,
  },
});

export const BodyText = ({ children, style }) => (
  <Text style={{ ...styles.body, ...style }}>
    {children}
  </Text>
);

BodyText.defaultProps = {
  style: {},
};

BodyText.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
