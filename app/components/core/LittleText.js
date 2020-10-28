import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
import BaseText from '../base_text/base_text';

const styles = StyleSheet.create({
  body: {
    fontWeight: 'normal',
    fontSize: 13,
    color: colors.grey,
  },
});

export const LittleText = ({ children, style }) => (
  <BaseText style={[styles.body, style]}>{children}</BaseText>
);

LittleText.defaultProps = {
  style: {},
};

LittleText.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};
