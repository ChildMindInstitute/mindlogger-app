import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Player, MediaStates } from 'react-native-audio-toolkit';
import { Text, Button, Icon } from 'native-base';
import { randomLink } from '../../helper';
import GImage from '../image/Image';

const styles = StyleSheet.create({
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

class ScreenDisplay extends Component {
  componentDidMount() {
    const { screen, authToken } = this.props;
    const { audio } = screen.meta;
    if (audio && audio.display && audio.files.length > 0) {
      this.audioLink = randomLink(audio.files, authToken);
      if (audio.autoPlay) {
        this.playAudio();
      }
    }
  }

  componentWillUnmount() {
    if (this.player && this.player.state !== MediaStates.DESTROYED) {
      this.player.destroy();
    }
  }

  playAudio = () => {
    if (this.player && this.player.state !== MediaStates.DESTROYED) {
      this.player.stop();
      this.player = null;
    } else {
      console.log(this.audioLink);
      this.player = new Player(this.audioLink, {
        autoDestroy: true,
      }).prepare((err) => {
        if (err) {
          console.log('error at _reloadPlayer():');
          console.log(err);
        } else {
          this.player.playPause();
        }
      });
    }
  }

  render() {
    const { screen } = this.props;
    const data = screen.meta || {};

    const hasPicture = data.pictureVideo
      && data.pictureVideo.display
      && data.pictureVideo.files.length > 0;

    const hasAudio = data.audio
      && data.audio.display
      && data.audio.files.length > 0
      && data.audio.playbackIcon;

    return (
      <View>
        {data.text && <Text style={styles.text}>{data.text}</Text>}
        {hasPicture && (
          <GImage
            file={data.pictureVideo.files}
            style={{ width: '100%', height: 200, resizeMode: 'cover' }}
          />
        )}
        {hasAudio && (
          <Button transparent onPress={this.playAudio}>
            <Icon name="volume-up" />
          </Button>
        )}
      </View>
    );
  }
}

ScreenDisplay.propTypes = {
  screen: PropTypes.object.isRequired,
  authToken: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  authToken: state.core.auth.token,
});

export default connect(mapStateToProps)(ScreenDisplay);
