import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { getURL } from '../../services/helper';
import { AudioPlayer } from './AudioPlayer';

export class AudioStimulus extends Component {
  componentDidUpdate(oldProps) {
    const { isCurrent, config, value } = this.props;
    if (isCurrent && oldProps.isCurrent !== isCurrent) {
      if (config.autoStart) {
        // auto start the audio player
        this.player.start();
      }
    } else if (!isCurrent && oldProps.isCurrent !== isCurrent) {
      // Stop the audio player if it isn't the current screen
      if (value === false) {
        this.player.reset();
      } else {
        this.player.stop();
      }
    }
  }

  render() {
    const { config, onChange } = this.props;
    const url = config.stimulus.contentUrl
      ? config.stimulus.contentUrl.en
      : config.stimulus;

    // There is an audio-toolkit bug which requires the file:// prefix even on iOS
    const safeUrl = getURL(url).replace('file://', '');

    return (
      <View style={{ paddingTop: 16, paddingBottom: 16 }}>
        <AudioPlayer
          source={`${safeUrl}`}
          ref={(ref) => { this.player = ref; }}
          allowReplay={config.allowReplay}
          onEnd={() => onChange(true)}
        />
      </View>
    );
  }
}

AudioStimulus.defaultProps = {
  value: false,
  config: {
    stimulus: '',
    autoStart: false,
  },
};

AudioStimulus.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
  config: PropTypes.shape({
    stimulus: PropTypes.string,
    autoStart: PropTypes.bool,
    autoAdvance: PropTypes.bool,
    allowReplay: PropTypes.bool,
  }),
};
