import React, { Component } from 'react'
import { Text, View } from 'react-native'
import SurveyMultiSelector from './SurveyMultiSelector';
import SurveyTableInput from './SurveyTableInput';
import SurveyTableSelector from './SurveyTableSelector';
import SurveySliderInput from './SurveySliderInput';
import SurveyTimeInput from './SurveyTimeInput';
import SurveyAudioInput from './SurveyAudioInput';

export default class SurveySection extends Component {
  resetData = () => {
    if(this.audioInput) {
      this.audioInput.reset();
    }
      
  }
  render() {
    const {type, config, answer, onChange, onNextChange} = this.props;
    if (type=='list' && config.mode=='single')
      return (
      <SurveyMultiSelector
        config={config}
        answer={answer}
        onChange={onChange}
        onNextChange={onNextChange}
        />);
    else if (type=='list' && config.mode=='order')
        return (
          <View></View>
        )
    else if (type=='table' && config.mode!='select')
        return (
          <SurveyTableInput
            config={config}
            answer={answer}
            onChange={onChange}
            />
        )
    else if (type=='table' && config.mode=='select')
        return <SurveyTableSelector
          config={config}
          answer={answer}
          onChange={onChange}
          />
    else if (type=='slider')
          return <View style={{flexGrow:3}}><SurveySliderInput
          config={config}
          answer={answer}
          onChange={onChange}
          onNextChange={onNextChange}
          /></View>
    else if (type == 'time')
          return <View style={{flexGrow:3}}><SurveyTimeInput
          config={config}
          answer={answer}
          onChange={onChange}
          /></View>
    else if (type=='audio')
      return <View style={{flexGrow:3}}><SurveyAudioInput
      config={config}
      answer={answer}
      onChange={onChange}
      onNextChange={onNextChange}
      ref={ref => this.audioInput = ref}
      /></View>
    else
      return (<View></View>);
  }
}