import React, { Component } from 'react'
import { Text, View } from 'react-native'
import SurveyMultiSelector from './SurveyMultiSelector';
import SurveyTableInput from './SurveyTableInput';
import SurveyTableSelector from './SurveyTableSelector';

export default class SurveySection extends Component {
  render() {
    const {type, config, answer, onChange, onNextChange} = this.props;
    console.log(config);
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
    else
      return (<View></View>);
  }
}