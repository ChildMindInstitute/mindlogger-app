import React from 'react';
import {
  Platform,
  PermissionsAndroid,
  StyleSheet,
  Slider
} from 'react-native';

import {Text, Switch, View,Button} from 'native-base';

import randomString from 'random-string';
import {AudioUtils} from 'react-native-audio';

import {
  Player,
  Recorder,
  MediaStates
} from 'react-native-audio-toolkit';

class AudioRecord extends React.Component {
  constructor() {
    super();
    //let audioPath = AudioUtils.DocumentDirectoryPath + `/${randomString({length:16})}.aac`;
    const filename = `${randomString({length:20})}.aac`
    const path = `${AudioUtils.DocumentDirectoryPath}/${filename}` 
    this.filename = Platform.OS == 'android' ? `file://${path}` : filename
    this.output_path = path
    this.state = {

      playPauseButton: 'Preparing...',
      recordButton: 'Preparing...',

      stopButtonDisabled: true,
      playButtonDisabled: true,
      recordButtonDisabled: true,

      loopButtonStatus: false,
      progress: 0,

      error: null
    };
  }

  _checkPermission() {
    if (Platform.OS !== 'android') {
      return Promise.resolve(true);
    }

    const rationale = {
      'title': 'Microphone Permission',
      'message': 'Child Mind App needs access to your microphone so you can record audio.'
    };

    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
      .then((result) => {
        console.log('Permission result:', result);
        return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
      });
  }


  componentWillMount() {
    const {timeLimit} = this.props
    this.player = null;
    this.recorder = null;
    this.lastSeek = 0;
    if(this.props.path) {
      this.filename = Platform.OS == 'android' ? this.props.path : this.props.path.replace(/^.*[\\\/]/, '')
    }
    this._checkPermission().then((hasPermission) => {
      this.setState({ hasPermission });

      if (!hasPermission) return;

      this._reloadPlayer();
      this._reloadRecorder();
      
    })
    
    console.log(this.filename)
    this._progressInterval = setInterval(() => {
      if (this.player && this._shouldUpdateProgressBar()) {// && !this._dragging) {
        this.setState({progress: Math.max(0, this.player.currentTime) / this.player.duration});
      }
    }, 100);
    this._recordInterval = setInterval( () => {
      if (this.recorder && this.recorder.isRecording) {
        let duration = (Date.now() - this.startTime)/1000
        if(timeLimit && timeLimit>0 && duration >= timeLimit) {
          this._toggleRecord()
        }
        if(this.props.onProgress)
          this.props.onProgress(duration)
      }
    }, 500)
  }

  componentWillUnmount() {
    //console.log('unmount');
    // TODO
    clearInterval(this._progressInterval);
    if(this._recordInterval)
      clearInterval(this._recordInterval)
  }

  _shouldUpdateProgressBar() {
    // Debounce progress bar update by 200 ms
    return Date.now() - this.lastSeek > 200;
  }

  recordButtonText() {
    return this.recorder  && this.recorder.isRecording ? 'Stop' : (this.props.recordLabel || 'Record')
  }

  _updateState(err) {
    this.setState({
      playPauseButton:      this.player    && this.player.isPlaying     ? 'Pause' : 'Play',

      stopButtonDisabled:   !this.player   || !this.player.canStop,
      playButtonDisabled:   !this.player   || !this.player.canPlay || this.recorder.isRecording,
      recordButtonDisabled: !this.recorder || (this.player         && !this.player.isStopped),
    });
  }

  _playPause() {
    this.player.playPause((err, playing) => {
      if (err) {
        this.setState({
          error: err.message
        });
      }
      this._updateState();
    });
  }

  _stop() {
    this.player.stop(() => {
      this._updateState();
    });
  }

  _seek(percentage) {
    if (!this.player) {
      return;
    }

    this.lastSeek = Date.now();

    let position = percentage * this.player.duration;

    this.player.seek(position, () => {
      this._updateState();
    });
  }

  _reloadPlayer() {
    if (this.player) {
      this.player.destroy();
    }

    this.player = new Player(this.filename, {
      autoDestroy: false
    }).prepare((err) => {
      if (err) {
        console.log('error at _reloadPlayer():');
        console.log(err);
      } else {
        this.player.looping = this.state.loopButtonStatus;
      }

      this._updateState();
    });

    this._updateState();

    this.player.on('ended', () => {
      this._updateState();
    });
    this.player.on('pause', () => {
      this._updateState();
    });
  }

  _reloadRecorder() {
    if (this.recorder) {
      this.recorder.destroy();
    }

    this.recorder = new Recorder(this.filename, {
      bitrate: 256000,
      channels: 2,
      sampleRate: 44100,
      quality: 'max'
      //format: 'ac3', // autodetected
      //encoder: 'aac', // autodetected
    });

    this._updateState();
  }

  _toggleRecord() {
    if (this.player) {
      this.player.destroy();
    }

    this.recorder.toggleRecord((err, stopped) => {
      if (err) {
        this.setState({
          error: err.message
        });
        console.log(err)
      }
      if (stopped) {
        this._reloadPlayer();
        this._reloadRecorder();
        this.props.onRecordFile(this.output_path, (Date.now() - this.startTime)/1000);
      } else {
        this.startTime = Date.now()
        if(this.props.onStart) this.props.onStart(this.filename)
      }

      this._updateState();
    });
  }

  _toggleLooping(value) {
    this.setState({
      loopButtonStatus: value
    });
    if (this.player) {
      this.player.looping = value;
    }
  }
  renderSingleMode() {
    return (
      <View>
        <Button full disabled={this.state.recordButtonDisabled} onPress={() => this._toggleRecord()}>
          <Text>{this.recordButtonText()}</Text>
        </Button>
      </View>
    );
  }
  renderNormalMode() {
    return (
      <View style={{flexDirection:'column'}}>
        <View style={styles.buttonContainer}>
          <Button disabled={this.state.recordButtonDisabled} onPress={() => this._toggleRecord()}>
            <Text>{this.recordButtonText()}</Text>
          </Button>
          <Button disabled={this.state.playButtonDisabled} onPress={() => this._playPause()}>
            <Text>{this.state.playPauseButton}</Text>
          </Button>
          <Button disabled={this.state.stopButtonDisabled} onPress={() => this._stop()}>
            <Text>Stop</Text>
          </Button>
        </View>
        <View style={styles.slider}>
          <Slider step={0.0001} disabled={this.state.playButtonDisabled} onValueChange={(percentage) => this._seek(percentage)} value={this.state.progress}/>
        </View>
        <View>
          <Text style={styles.errorMessage}>{this.state.error}</Text>
        </View>
      </View>
    );
  }
  renderAdvancedMode() {
    return (
      <View style={{flexDirection:'column'}}>
        <View style={styles.buttonContainer}>
          <Button disabled={this.state.recordButtonDisabled} onPress={() => this._toggleRecord()}>
            <Text>{this.recordButtonText()}</Text>
          </Button>
          <Button disabled={this.state.playButtonDisabled} onPress={() => this._playPause()}>
            <Text>{this.state.playPauseButton}</Text>
          </Button>
          <Button disabled={this.state.stopButtonDisabled} onPress={() => this._stop()}>
            <Text>Stop</Text>
          </Button>
        </View>
        <View style={styles.settingsContainer}>
          <Switch
          onValueChange={(value) => this._toggleLooping(value)}
          value={this.state.loopButtonStatus} />
          <Text>Toggle Looping</Text>
        </View>
        <View style={styles.slider}>
          <Slider step={0.0001} disabled={this.state.playButtonDisabled} onValueChange={(percentage) => this._seek(percentage)} value={this.state.progress}/>
        </View>
        <View>
          <Text style={styles.errorMessage}>{this.state.error}</Text>
        </View>
      </View>
    );
  }
  render() {
    const {mode} = this.props
    if(mode == "single") {
      return this.renderSingleMode()
    } else if(mode == "advanced") {
      return this.renderAdvancedMode()
    } else {
      return this.renderNormalMode()
    }
  }
}

var styles = StyleSheet.create({
  slider: {
    height: 10,
    margin: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
  errorMessage: {
    textAlign: 'center',
    padding: 10,
    color: 'red'
  }
});

export default AudioRecord;