import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { H3, Text, Button } from 'native-base';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: 3,
    width: '90%',
    backgroundColor: colors.secondary,
    padding: 30,
  },
  header: {
    width: '100%',
    textAlign: 'center',
    marginBottom: 16,
  },
  bodyCopy: {
    marginBottom: 16,
  },
  buttonArea: {
    flexDirection: 'row',
  },
  button: {
    justifyContent: 'center',
    flex: 1,
    fontSize: 14,
    margin: 2,
  },
});

const LogoutWarning = ({ onCancel, onLogout }) => (
  <View style={styles.container}>
    <View style={styles.modal}>
      <H3 style={styles.header}>Uploads in progress</H3>
      <Text style={styles.bodyCopy}>
        You have responses that are currently uploading. If you log out now your
        responses will be lost.
      </Text>
      <Text style={styles.bodyCopy}>Are you sure that you want to log out?</Text>
      <View style={styles.buttonArea}>
        <Button bordered style={styles.button} onPress={onCancel}><Text>Cancel</Text></Button>
        <Button style={styles.button} onPress={onLogout}><Text>Logout</Text></Button>
      </View>
    </View>
  </View>
);

LogoutWarning.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default LogoutWarning;
