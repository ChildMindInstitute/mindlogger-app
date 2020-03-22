import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.alert,
    width: 15,
    height: 15,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginLeft: 12,
    marginTop: 6,
    borderRadius: 10,
    elevation: 1,
    position: 'absolute',
  },
});

export const NotificationDot = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.container} />
);

NotificationDot.propTypes = {
  onPress: PropTypes.func.isRequired,
};
