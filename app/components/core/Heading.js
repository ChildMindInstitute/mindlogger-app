import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
import BaseText from '../base_text/base_text';

const styles = StyleSheet.create({
  heading: {
    fontWeight: 'bold',
    fontSize: 24,
    color: colors.tertiary,
  },
});

export const Heading = ({ children, style = {} }) => (
  <BaseText style={[styles.heading, style]}>{children}</BaseText>
);

Heading.defaultProps = {
  style: {},
};

Heading.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};
