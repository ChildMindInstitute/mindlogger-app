import React, { Component } from 'react';
import { View, Platform, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Recorder } from 'react-native-audio-toolkit';
import Permissions from 'react-native-permissions';
import randomString from 'random-string';

let intervalId = null;
let recorder = null;

export class AudioRecorder extends Component {
  constructor() {
    super();
    this.state = {
      recorderState: 'ready',
      elapsed: null,
      path: null,
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

  startRecording = () => {
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

  stopRecording = () => {
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
      });
    }
  }

  render() {
    const { recorderState, elapsed, path } = this.state;
    return (
      <View>
        <Text>{recorderState}</Text>
        {(recorderState === 'ready' || recorderState === 'stopped') && (
          <TouchableOpacity onPress={this.startRecording}>
            <Text>Record</Text>
          </TouchableOpacity>
        )}
        {recorderState === 'recording' && (
          <TouchableOpacity onPress={this.stopRecording}>
            <Text>Stop</Text>
          </TouchableOpacity>
        )}
        {(recorderState === 'recording' || recorderState === 'stopped') && (
          <View>
            <Text>{Math.round(elapsed / 1000)} seconds</Text>
            <Text>{path}</Text>
          </View>
        )}
      </View>
    );
  }
}

AudioRecorder.defaultProps = {
  maxLength: Infinity,
};

AudioRecorder.propTypes = {
  maxLength: PropTypes.number,
};
