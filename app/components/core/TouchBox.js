import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  box: {
    borderRadius: 12,
    elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.3,
    // shadowRadius: 2,
    borderStyle: 'solid',
    borderColor: colors.lightGrey,
    borderWidth: 4,
    backgroundColor: 'white', // '#F0F0F0',
    padding: 16,
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
  },
});

const TouchBox = ({ children, disabled, onPress, onLongPress }) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.box}>{children}</View>
    </TouchableOpacity>
  );
};

TouchBox.propTypes = {
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  onLongPress: PropTypes.func,
};

const mapStateToProps = state => ({
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TouchBox);
