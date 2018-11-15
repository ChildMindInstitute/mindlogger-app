import React, {Component} from 'react';
import {View} from 'react-native';
import { ListItem, Text, Right, Body, CheckBox, Radio, Toast } from 'native-base';
import { connect } from 'react-redux';

import GImage from '../../../../components/image/Image';
import Slider from '../../../../components/slider';

class SurveySliderInput extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    let answer = this.props.answer;
    this.onAnswer(answer);
  }

  checkValue = (value) => {
    const {onChange} = this.props;
    this.onAnswer(value);
    onChange(value, true);
  }

  onAnswer(answer) {
    const { config: {options}, onNextChange} = this.props;
    if(answer) {
      let index = Math.floor(answer) - 1;
      onNextChange(options[index].screen);
    }
  }

  render() {
    const { config: {options, optionsCount, increments}, answer} = this.props;
    return (
      <View style={{alignItems:'stretch', flex: 1}}>
        <Slider
          value={answer || 0}
          min={1}
          max={optionsCount || 100}
          labels={options}
          strict={increments == 'Discrete'}
          barHeight={300}
          onChange={this.checkValue}
          />
      </View>
    )
  }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveySliderInput);
