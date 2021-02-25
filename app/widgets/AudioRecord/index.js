/* eslint-disable radix */
import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import AudioRecorder from './AudioRecorder';

export class AudioRecord extends Component {
  onRecord = (filePath) => {
    const filename = (filePath && filePath.length > 0) && filePath.split('/').pop();
    this.props.onChange({ uri: filePath, filename });
  }

  render() {
    const { value, config } = this.props;
    const maxLength = parseInt(R.path(['maxValue'], config));
    return (
      <View style={{ paddingTop: 16, paddingBottom: 16 }}>
        <AudioRecorder
          onStop={this.onRecord}
          path={value && value.uri}
          maxLength={Number.isNaN(maxLength) ? Infinity : maxLength}
        />
      </View>
    );
  }
}

AudioRecord.defaultProps = {
  value: undefined,
};

AudioRecord.propTypes = {
  value: PropTypes.shape({
    uri: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};
