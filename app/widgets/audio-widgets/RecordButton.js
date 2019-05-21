import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Icon } from 'native-base';
import { colors } from '../../themes/colors';

const styles = StyleSheet.create({
  recordButton: {
    borderRadius: 3,
    backgroundColor: colors.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 160,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 1,
  },
  stopButton: {
    width: 160,
    borderRadius: 3,
    backgroundColor: colors.alert,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 1,
  },
  recordText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
    marginLeft: 5,
    marginRight: 5,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: colors.tertiary,
    fontSize: 16,
  },
});

const renderButton = (recording, onPress, disabled) => {
  // Recording
  if (recording) {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.stopButton}>
          <Text style={styles.recordText}>STOP</Text>
          <Icon style={styles.recordText} type="FontAwesome" name="stop" />
        </View>
      </TouchableOpacity>
    );
  }

  // Not recording
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View style={[styles.recordButton, disabled ? { opacity: 0.2 } : { opacity: 1 }]}>
        <Text style={styles.recordText}>RECORD</Text>
        <Icon style={styles.recordText} type="FontAwesome" name="microphone" />
      </View>
    </TouchableOpacity>
  );
};

const renderInfo = (recording, elapsed) => {
  if (elapsed !== null) {
    return (
      <View>
        <Text style={styles.infoText}>{recording ? 'Recording...' : 'File saved.'}</Text>
        <Text style={styles.infoText}>{Math.round(elapsed / 1000)} seconds</Text>
      </View>
    );
  }
  return null;
};

const RecordButton = ({ elapsed, onPress, recording, disabled }) => (
  <View style={styles.container}>
    {renderButton(recording, onPress, disabled)}
    {renderInfo(recording, elapsed)}
  </View>
);

RecordButton.defaultProps = {
  elapsed: null,
};

RecordButton.propTypes = {
  recording: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
  elapsed: PropTypes.number,
};

export default RecordButton;
