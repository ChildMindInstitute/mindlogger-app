import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  body: {
    fontWeight: 'normal',
    fontSize: 13,
    color: colors.grey,
  },
});

export const LittleText = ({ children, style }) => (
  <Text style={[ styles.body, style ]}>
    {children}
  </Text>
);

LittleText.defaultProps = {
  style: {},
};

LittleText.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
