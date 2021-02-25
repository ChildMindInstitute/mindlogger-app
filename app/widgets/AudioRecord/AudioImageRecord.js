/* eslint-disable radix */
import React, { Component } from 'react';
import { View, Image } from 'react-native';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import AudioRecorder from './AudioRecorder';
import { getURL } from '../../services/helper';

export class AudioImageRecord extends Component {
  onRecord = (filePath) => {
    const filename = filePath && filePath.length > 0 && filePath.split('/').pop();
    this.props.onChange({ uri: filePath, filename });
  };

  render() {
    const { value, config } = this.props;
    const maxLength = parseInt(R.path(['maxValue'], config));
    return (
      <View style={{ paddingBottom: 16 }}>
        <Image
          style={{
            width: '100%',
            height: 260,
            resizeMode: 'contain',
            marginBottom: 16,
          }}
          source={{ uri: getURL(config.image) }}
        />
        <AudioRecorder
          onStop={this.onRecord}
          path={value && value.uri}
          maxLength={Number.isNaN(maxLength) ? Infinity : maxLength}
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
    image: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
