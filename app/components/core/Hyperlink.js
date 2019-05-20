import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../themes/colors';

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.primary,
  },
});

export const Hyperlink = ({ children, onPress, style, disabled }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled}>
    <Text style={[styles.text, disabled ? { opacity: 0.5 } : { opacity: 1 }, style]}>
      {children}
    </Text>
  </TouchableOpacity>
);

Hyperlink.defaultProps = {
  style: {},
  disabled: false,
};

Hyperlink.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  disabled: PropTypes.bool,
};
