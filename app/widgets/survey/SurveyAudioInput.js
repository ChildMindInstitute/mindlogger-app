import React, {Component} from 'react';
import {View} from 'react-native';
import AudioRecord from '../../components/audio/AudioRecord';


export default class SurveyAudioInput extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  reset() {
    this.audioRef._delete();
  }

  onRecord = (filePath) => {
    let filename = (filePath && filePath.length > 0) && filePath.split('/').pop();
    this.props.onChange({uri: filePath, filename});
  }

  render() {
    const { answer } = this.props;
    return (
      <View style={{alignItems:'stretch', flex: 3}}>
        <AudioRecord mode="single" onRecordFile={this.onRecord} path={answer && answer.uri} ref={ref => this.audioRef = ref}/>
      </View>
    )
  }
}
