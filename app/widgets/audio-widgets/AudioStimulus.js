import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { AudioPlayer } from './AudioPlayer';

export class AudioStimulus extends Component {
  componentDidUpdate(oldProps) {
    const { isCurrent, config } = this.props;
    if (isCurrent && oldProps.isCurrent !== isCurrent) {
      if (config.autoStart) {
        // auto start the audio player
        this.player.start();
      }
    } else if (!isCurrent && oldProps.isCurrent !== isCurrent) {
      // Stop the audio player if it isn't the current screen
      this.player.reset();
    }
  }

  render() {
    const { config, onChange } = this.props;
    return (
      <View style={{ paddingTop: 16, paddingBottom: 16 }}>
        <AudioPlayer
          source={config.stimulus.contentUrl.en}
          ref={(ref) => { this.player = ref; }}
          allowReplay={config.allowReplay}
          onEnd={() => onChange(true)}
        />
      </View>
    );
  }
}

AudioStimulus.defaultProps = {
  config: {
    stimulus: {},
    autoStart: false,
  },
};

AudioStimulus.propTypes = {
  onChange: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
  config: PropTypes.shape({
    stimulus: PropTypes.shape({
      contentUrl: PropTypes.object,
    }),
    autoStart: PropTypes.bool,
    autoAdvance: PropTypes.bool,
    allowReplay: PropTypes.bool,
  }),
};
