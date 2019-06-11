import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

const ActHeader = () => (
  <TouchableOpacity style={styles.button} onPress={() => { Actions.pop(); }}>
    <Icon type="FontAwesome" name="close" style={{ color: colors.tertiary }} />
  </TouchableOpacity>
);

export default ActHeader;
