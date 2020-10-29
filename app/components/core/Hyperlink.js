import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../themes/colors';
import BaseText from '../base_text/base_text';

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.primary,
  },
});

export const Hyperlink = ({ children, onPress, style, disabled }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} style={{ alignSelf: 'flex-start' }}>
    <BaseText style={[styles.text, disabled ? { opacity: 0.5 } : { opacity: 1 }, style]}>
      {children}
    </BaseText>
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
