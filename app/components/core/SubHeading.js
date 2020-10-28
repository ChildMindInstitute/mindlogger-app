import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
import theme from '../../themes/base-theme';
import BaseText from '../base_text/base_text';

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
  <BaseText style={{ ...styles.subHeading, ...style }}>{children}</BaseText>
);

SubHeading.defaultProps = {
  style: {},
};

SubHeading.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
