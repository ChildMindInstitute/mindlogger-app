import React, { Component } from 'react';
import { Platform, StyleSheet, Alert, Linking } from 'react-native';
import PropTypes from 'prop-types';
import { Recorder } from '@react-native-community/audio-toolkit';
import randomString from 'random-string';
import Permissions, { PERMISSIONS } from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';
import i18n from 'i18next';
import RecordButton from './RecordButton';
import BaseText from '../../components/base_text/base_text';
import { colors } from '../../theme';


let intervalId = null;
let recorder = null;

const styles = StyleSheet.create({
  infoText: {
    color: colors.tertiary,
    fontSize: 16,
  },
});

export default class AudioRecorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recorderState: 'ready',
      elapsed: null,
      path: props.path,
      permission: '',
    };
  }

  componentDidUpdate(prevProps) {
    const { maxLength, path } = this.props;
    const { elapsed } = this.state;
    if (elapsed > maxLength) {
      this.stopRecording();
    }
    if (prevProps.path !== path) {
      this.reset();
    }
  }

  componentWillUnmount() {
    if (recorder) {
      recorder.destroy();
    }
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  record = () => {
    const filename = Platform.OS === 'android'
      ? `${randomString({ length: 20 })}.mp4`
      : `${randomString({ length: 20 })}.aac`;
    recorder = new Recorder(filename, {
      bitrate: 128000,
      channels: 1,
      sampleRate: 44100,
    });

    // Delete old recording if there is one
    if (this.state.path !== null) {
      RNFetchBlob.fs.unlink(this.state.path.replace('file://', ''));
    }

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

          return ;
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
  };

  startRecording = () => {
    const permission = Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE,
    });
    Permissions.check(permission).then((response) => {
      if (response !== Permissions.RESULTS.GRANTED) {
        Permissions.request(permission).then((response) => {
          this.setState({ permission: response });
          if (response === Permissions.RESULTS.BLOCKED) {
            Alert.alert(
              i18n.t('audio_recorder:alert_title'),
              i18n.t('audio_recorder:alert_message'),
              [
                {
                  text: i18n.t('audio_recorder:alert_button_cancel'),
                  onPress: () => { this.setState({ permission: Permissions.RESULTS.DENIED }); },
                  style: 'cancel',
                },
                {
                  text: i18n.t('audio_recorder:alert_button_ok'),
                  onPress: Linking.openSettings.bind(Linking),
                  style: 'default',
                },
              ],
            );
          }
        });
      } else {
        this.setState({ permission: response });
        if (response === Permissions.RESULTS.GRANTED) {
          this.record();
        }
      }
    });
  };

  stopRecording = () => {
    const { onStop } = this.props;
    const { path } = this.state;
    console.log({ path });
    if (recorder && recorder.isRecording) {
      recorder.stop((e) => {
        if (e) {
          const { err, message } = e;
          console.warn(err, message);
        }
        clearInterval(intervalId);
        intervalId = null;
        this.setState({
          recorderState: 'stopped',
        });
        onStop(path);
      });
    }
  };

  reset = () => {
    const { path } = this.props;
    if (recorder && recorder.isRecording) {
      recorder.stop((e) => {
        if (e) {
          const { err, message } = e;
          console.warn(err, message);
        }
      });
    }
    clearInterval(intervalId);
    intervalId = null;
    this.setState({
      recorderState: 'ready',
      elapsed: null,
      path,
    });
  };

  render() {
    const { recorderState, elapsed, permission, path } = this.state;
    const { allowRetry } = this.props;
    if (
      permission !== 'authorized'
      && (permission === 'undetermined'
      || permission === 'denied')
    ) {
      return (
        <BaseText style={styles.infoText} textKey="audio_recorder:permission" />
      );
    }

    return (
      <RecordButton
        onPress={
          recorderState === 'recording'
            ? this.stopRecording
            : this.startRecording
        }
        elapsed={elapsed}
        disabled={
          recorderState !== 'recording' && allowRetry === false && path !== null
        }
        recording={recorderState === 'recording'}
        fileSaved={path !== null}
      />
    );
  }
}

AudioRecorder.defaultProps = {
  maxLength: Infinity,
  onStop: () => {},
  allowRetry: true,
  path: null,
};

AudioRecorder.propTypes = {
  path: PropTypes.string,
  maxLength: PropTypes.number,
  onStop: PropTypes.func,
  allowRetry: PropTypes.bool,
};
