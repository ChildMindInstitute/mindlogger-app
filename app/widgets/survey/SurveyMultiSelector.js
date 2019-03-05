import React, {Component} from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import SurveyMultiOption from './SurveyMultiOption';
import { Toast } from 'native-base';

export default class SurveyMultiSelector extends Component {
  componentDidMount() {
    let answer = this.props.answer || [];
    this.onAnswer(answer);
  }

  checkValue = (value) => {
    const { config: {optionsMax, optionsMin}, onChange, answer: oldAnswer} = this.props;
    let answer = oldAnswer ? [...oldAnswer] : [];
    
    let next = false;
    if (optionsMax==1 && optionsMin==1) {
      answer = [value];
      next = true;
    } else {
      const index = answer.indexOf(value);
      if (index<0) {
        if (answer.length<optionsMax) {
          answer.push(value);
        } else {
          Toast.show({text: `You can not select more than ${optionsMax} options`, type: 'info', duration: 1000});
        }
      } else {
        if (answer.length>optionsMin) {
          answer.splice(index, 1);
        } else if (answer.length==optionsMin) {
          Toast.show({text: `You can not select less than ${optionsMin} options`, type: 'info', duration: 1000});
        }
      }
    }
    this.onAnswer(answer);
    let validated = (answer.length<=optionsMax) && (answer.length>=optionsMin);
    onChange(answer, validated, next);
  }

  onAnswer(answer) {
    const { config: {optionsMax, optionsMin, options}, onNextChange} = this.props;
    if (optionsMax === 1 && optionsMin === 1) {
      if (answer.length > 0) {
        onNextChange(options[answer[0]].screen);
      }
      else {
        onNextChange(undefined);
      }
    }
  }

  render() {
    const { config: {options, optionsMax, optionsMin}, answer } = this.props;
    const isRadio = (optionsMax === 1) && (optionsMin === 1);
    return (
      <View style={{alignItems:'stretch'}}>
        {
          options.map((row, idx) => (
            <SurveyMultiOption
              key={idx}
              row={row}
              onPress={() => this.checkValue(idx)}
              isRadio={isRadio}
              isSelected={answer && answer.includes(idx)}
            />
          ))
        }
      </View>
    );
  }
}

SurveyMultiSelector.propTypes = {
  config: PropTypes.shape({
    options: PropTypes.object,
    optionsMax: PropTypes.number,
    optionsMin: PropTypes.number,
  }).isRequired,
  answer: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onNextChange: PropTypes.func.isRequired,
};
