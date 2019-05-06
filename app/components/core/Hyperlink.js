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

export const Hyperlink = ({ children, onPress, style }) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={{ ...styles.text, ...style }}>
      {children}
    </Text>
  </TouchableOpacity>
);

Hyperlink.defaultProps = {
  style: {},
};

Hyperlink.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
};
