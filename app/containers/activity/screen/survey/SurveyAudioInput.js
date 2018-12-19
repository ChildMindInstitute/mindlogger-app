import React, {Component} from 'react';
import {View} from 'react-native';
import { connect } from 'react-redux';
import AudioRecord from '../../../../components/audio/AudioRecord';


class SurveyAudioInput extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    console.log(this.props.answer);
  }

  checkValue = (value) => {
    const {onChange} = this.props;
    //this.onAnswer(value);
    console.log(value);
    onChange(value, true);
  }

  render() {
    const { answer, onChange} = this.props;
    return (
      <View style={{alignItems:'stretch', flex: 1}}>
        <AudioRecord mode="single" onRecordFile={(filePath)=>onChange(filePath)} path={answer}/>
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
