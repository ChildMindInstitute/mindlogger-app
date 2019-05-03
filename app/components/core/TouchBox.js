import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  box: {
    borderRadius: 3,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    backgroundColor: '#F0F0F0',
    padding: 16,
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
  },
});

export const TouchBox = ({ children, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.box}>
      {children}
    </View>
  </TouchableOpacity>
);

TouchBox.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func.isRequired,
};
