import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
import BaseText from '../base_text/base_text';

const styles = StyleSheet.create({
  body: {
    fontWeight: 'normal',
    fontSize: 16,
    color: colors.tertiary,
  },
});

export const BodyText = ({ children, style }) => (
  <BaseText style={[styles.body, style]}>{children}</BaseText>
);

BodyText.defaultProps = {
  style: {},
};

BodyText.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};
