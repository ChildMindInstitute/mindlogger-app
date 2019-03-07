import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'native-base';
const styles=StyleSheet.create({
  buttonText: {
    width: 68,
    textAlign: 'center',
  }
});

export default class ScreenButton extends Component {
  render() {
    const {transparent, onPress, text, children} = this.props;
    return (<Button transparent={transparent} onPress={onPress}>
      {text && <Text style={styles.buttonText}>{text}</Text> }
      {children}
    </Button>)
  }
}