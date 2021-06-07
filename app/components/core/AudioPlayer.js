import React, { useEffect } from "react";
import { Text, Image, TouchableOpacity } from "react-native";
import { connect } from 'react-redux';

import SoundPlayer from 'react-native-sound-player';
import { setCurrentMedia } from '../../state/media/media.actions';
import { currentMediaSelector } from '../../state/media/media.selectors';

const img_play = require('../../../img/audio-play/ui_play.png');
const img_pause = require('../../../img/audio-play/ui_pause.png');

const AudioPlayer = ({ uri, content, currentMedia, setCurrentMedia}) => {
  const pause = () => {
    SoundPlayer.pause();
    setCurrentMedia(null);
  }

  const play = () => {
    SoundPlayer.playUrl(uri);
    SoundPlayer.addEventListener('FinishedPlaying', () => {
      setCurrentMedia(null);
    })

    setCurrentMedia(uri);
  }

  useEffect(() => {
    return () => {
      if (uri == currentMedia) {
        setCurrentMedia(null);
      }
    }
  }, []);

  return (
    <Text style={{ fontSize: 20 }}>
      {content}
      (
        {
          currentMedia != uri ? (
            <TouchableOpacity onPress={play} style={{ marginTop: -2 }}>
              <Image source={img_play} style={{width: 20, height: 20}}/>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={pause} style={{ marginTop: -2 }}>
              <Image source={img_pause} style={{width: 20, height: 20}}/>
            </TouchableOpacity>
          )
        }
      )
    </Text>
  )
}

const mapStateToProps = state => ({
  currentMedia: currentMediaSelector(state),
});

const mapDispatchToProps = {
  setCurrentMedia
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AudioPlayer);
