import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default ({...props}) => {
  const text = [styles.text];
  if (props.black) {
    text.push(styles.blackText);
  }
  return (
    <LinearGradient
      colors={
        props.black ? ['#FFFFFF', '#FFFFFF'] : ['#7EB7E4', '#8DCDD6', '#9FE7C5']
      }
      style={[styles.container, props.style]}>
      <Text style={text}>{props.title}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 30,
  },
  blackText: {
    color: 'black',
  },
});
