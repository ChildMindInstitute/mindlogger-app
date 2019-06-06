import React, { Component } from 'react';
import { View, Image } from 'react-native';
import PropTypes from 'prop-types';
import AudioRecorder from './AudioRecorder';

export class AudioImageRecord extends Component {
  onRecord = (filePath) => {
    const filename = (filePath && filePath.length > 0) && filePath.split('/').pop();
    this.props.onChange({ uri: filePath, filename });
  }

  render() {
    const { value, config } = this.props;
    return (
      <View style={{ paddingBottom: 16 }}>
        <Image
          style={{ width: '100%', height: 260, resizeMode: 'contain', marginBottom: 16 }}
          source={{ uri: config.image.en }}
        />
        <AudioRecorder
          onStop={this.onRecord}
          path={value && value.uri}
        />
      </View>
    );
  }
}

AudioImageRecord.defaultProps = {
  value: undefined,
};

AudioImageRecord.propTypes = {
  value: PropTypes.shape({
    uri: PropTypes.string,
  }),
  config: PropTypes.shape({
    image: PropTypes.object,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
