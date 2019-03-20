import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Button } from 'native-base';

const styles = StyleSheet.create({
  buttonText: {
    width: 68,
    textAlign: 'center',
  },
});

const ScreenButton = ({ transparent = false, onPress, text, children }) => (
  <Button transparent={transparent} onPress={onPress}>
    {text && <Text style={styles.buttonText}>{text}</Text> }
    {children}
  </Button>
);

export default ScreenButton;
