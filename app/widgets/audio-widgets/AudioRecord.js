import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import AudioRecorder from './AudioRecorder';

export class AudioRecord extends Component {
  onRecord = (filePath) => {
    const filename = (filePath && filePath.length > 0) && filePath.split('/').pop();
    this.props.onChange({ uri: filePath, filename });
  }

  render() {
    const { value } = this.props;
    return (
      <View style={{ paddingTop: 16, paddingBottom: 16 }}>
        <AudioRecorder
          onStop={this.onRecord}
          path={value && value.uri}
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
};
