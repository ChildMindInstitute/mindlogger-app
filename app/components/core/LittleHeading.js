import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
import BaseText from '../base_text/base_text';

const styles = StyleSheet.create({
  subHeading: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 5,
    color: colors.tertiary,
  },
});

export const LittleHeading = ({ children, style }) => (
  <BaseText style={[styles.subHeading, style]}>{children}</BaseText>
);

LittleHeading.defaultProps = {
  style: {},
};

LittleHeading.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};
