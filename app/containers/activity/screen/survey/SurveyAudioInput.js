import React, {Component} from 'react';
import {View} from 'react-native';
import { connect } from 'react-redux';
import AudioRecord from '../../../../components/audio/AudioRecord';


class SurveyAudioInput extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  onRecord = (filePath) => {
    let filename = (filePath && filePath.length > 0) && filePath.split('/').pop();
    this.props.onChange({uri: filePath, filename});
  }

  render() {
    const { answer } = this.props;
    return (
      <View style={{alignItems:'stretch', flex: 1}}>
        <AudioRecord mode="single" onRecordFile={this.onRecord} path={answer}/>
      </View>
    )
  }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveyAudioInput);
