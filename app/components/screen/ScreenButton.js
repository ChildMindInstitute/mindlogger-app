import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'native-base';

const styles = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
  },
});

const ScreenButton = ({ transparent = false, onPress, text, children }) => {
  return text
    ? (
      <Button transparent={transparent} onPress={onPress} style={styles.button}>
        <Text style={styles.buttonText}>{text}</Text>
        {children}
      </Button>
    )
    : (
      <Button transparent style={styles.button}>
        <Text style={styles.buttonText}> </Text>
      </Button>
    );
};

export default ScreenButton;
