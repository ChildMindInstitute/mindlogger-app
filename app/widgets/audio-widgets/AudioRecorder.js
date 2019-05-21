import React, { Component } from 'react';
import { View, Platform, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Recorder } from 'react-native-audio-toolkit';
import randomString from 'random-string';
import Permissions from 'react-native-permissions';
import RecordButton from './RecordButton';
import { colors } from '../../theme';

let intervalId = null;
let recorder = null;


const styles = StyleSheet.create({
  infoText: {
    color: colors.tertiary,
    fontSize: 16,
  },
});

export class AudioRecorder extends Component {
  constructor() {
    super();
    this.state = {
      recorderState: 'ready',
      elapsed: null,
      path: null,
      permission: 'undetermined',
    };
  }

  componentDidUpdate() {
    const { maxLength } = this.props;
    const { elapsed } = this.state;
    if (elapsed > maxLength) {
      this.stopRecording();
    }
  }

  componentWillUnmount() {
    this.state.recorder.destroy();
  }

  record = () => {
    const filename = Platform.OS === 'android'
      ? `${randomString({ length: 20 })}.mp4`
      : `${randomString({ length: 20 })}.aac`;
    recorder = new Recorder(filename);

    recorder.prepare((prepareErr, fsPath) => {
      // Check if there was an error preparing
      if (prepareErr) {
        const { err, message } = prepareErr;
        console.warn(err, message);
        this.setState({ recorderState: 'error' });
      }

      // Check if there was an error starting recording
      recorder.record((recordErr) => {
        if (recordErr) {
          const { err, message } = recordErr;
          console.warn(err, message);
          this.setState({ recorderState: 'error' });
        }
        this.setState({
          recorderState: 'recording',
          elapsed: 0,
          path: fsPath,
        });

        // Start an interval to update the timer every 100 ms
        const startTime = Date.now();
        intervalId = setInterval(() => {
          this.setState({
            elapsed: Date.now() - startTime,
          });
        }, 100);
      });
    });
  }

  startRecording = () => {
    Permissions.check('microphone').then((response) => {
      if (response !== 'authorized') {
        Permissions.request('microphone').then((response) => {
          this.setState({ permission: response });
          if (response === 'authorized') {
            this.record();
          }
        });
      } else {
        this.setState({ permission: response });
        this.record();
      }
    });
  }

  stopRecording = () => {
    const { onStop } = this.props;
    const { path } = this.state;
    if (recorder.isRecording) {
      recorder.stop((e) => {
        if (e) {
          const { err, message } = e;
          console.warn(err, message);
        }
        clearInterval(intervalId);
        this.setState({
          recorderState: 'stopped',
        });
        onStop(path);
      });
    }
  }

  render() {
    const { recorderState, elapsed, permission, path } = this.state;
    const { allowRetry } = this.props;

    if (permission !== 'authorized' && permission !== 'undetermined') {
      return (
        <Text style={styles.infoText}>
          You must grant permission to use your microphone to
          complete this task.
        </Text>
      );
    }

    return (
      <View>
        <RecordButton
          onPress={recorderState === 'recording' ? this.stopRecording : this.startRecording}
          elapsed={elapsed}
          disabled={recorderState !== 'recording' && allowRetry === false && path !== null}
          recording={recorderState === 'recording'}
        />
      </View>
    );
  }
}

AudioRecorder.defaultProps = {
  maxLength: Infinity,
  onStop: () => {},
  allowRetry: true,
};

AudioRecorder.propTypes = {
  maxLength: PropTypes.number,
  onStop: PropTypes.func,
  allowRetry: PropTypes.bool,
};
