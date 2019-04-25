import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import Audio from './Audio';

export class AudioRecord extends Component {
  onRecord = (filePath) => {
    const filename = (filePath && filePath.length > 0) && filePath.split('/').pop();
    this.props.onChange({ uri: filePath, filename });
  }

  reset() {
    this.audioRef._delete(); // eslint-disable-line
  }

  render() {
    const { value } = this.props;
    return (
      <View style={{ alignItems: 'stretch', flex: 3 }}>
        <Audio
          mode="single"
          onRecordFile={this.onRecord}
          path={value && value.uri}
          ref={(ref) => { this.audioRef = ref; }}
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
