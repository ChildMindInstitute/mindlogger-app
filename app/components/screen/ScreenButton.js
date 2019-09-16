import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
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

ScreenButton.defaultProps = {
  onPress: undefined,
  children: undefined,
  text: '',
};

ScreenButton.propTypes = {
  transparent: PropTypes.bool.isRequired,
  onPress: PropTypes.any,
  children: PropTypes.node,
  text: PropTypes.string,
};


export default ScreenButton;
