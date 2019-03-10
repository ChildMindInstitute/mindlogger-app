import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { Toast } from 'native-base';
import SurveyMultiOption from './SurveyMultiOption';

export default class SurveyMultiSelector extends Component {
  componentDidMount() {
    if (!this.props.answer) {
      const initialState = [];
      const answer = this.props.answer || initialState;
      this.onAnswer(answer);
    }
  }

  checkValue = (value) => {
    const { config: { optionsMax, optionsMin }, onChange, answer: oldAnswer } = this.props;
    let answer = oldAnswer ? [...oldAnswer] : [];
    let next = false;

    // If the multi select only handles 1 option, then change the answer. Otherwise
    // if it's a true multi select, push the option onto the answer array (if
    // it was not selected) or splice it (if it was selected already)
    if (optionsMax === 1 && optionsMin === 1) {
      answer = [value];
      next = true;
    } else {
      const index = answer.indexOf(value);
      if (index < 0) {
        if (answer.length < optionsMax) {
          answer.push(value);
        } else {
          Toast.show({ text: `You can not select more than ${optionsMax} options`, type: 'info', duration: 1000 });
        }
      } else if (answer.length > optionsMin) {
        answer.splice(index, 1);
      } else if (answer.length === optionsMin) {
        Toast.show({ text: `You can not select less than ${optionsMin} options`, type: 'info', duration: 1000 });
      }
    }
    this.onAnswer(answer);
    const validated = (answer.length <= optionsMax) && (answer.length >= optionsMin);
    onChange(answer, validated, next);
  }

  onAnswer = (answer) => {
    const { config: { optionsMax, optionsMin, options }, onNextChange } = this.props;
    if (optionsMax === 1 && optionsMin === 1) {
      if (answer.length > 0) {
        onNextChange(options[answer[0]].screen);
      } else {
        onNextChange(undefined);
      }
    }
  }

  render() {
    const { config: { options, optionsMax, optionsMin }, answer } = this.props;
    const isRadio = (optionsMax === 1) && (optionsMin === 1);
    return (
      <View style={{ alignItems: 'stretch' }}>
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

SurveyMultiSelector.defaultProps = {
  answer: undefined,
};

SurveyMultiSelector.propTypes = {
  config: PropTypes.shape({
    options: PropTypes.array,
    optionsMax: PropTypes.number,
    optionsMin: PropTypes.number,
  }).isRequired,
  answer: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onNextChange: PropTypes.func.isRequired,
};
