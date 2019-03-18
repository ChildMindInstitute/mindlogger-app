import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import SurveyMultiOption from './SurveyMultiOption';

export default class SurveyMultiSelector extends Component {
  static isValid(answer, { optionsMin = 1, optionsMax = Infinity }) {
    if (typeof answer === 'undefined'
      || answer.length < optionsMin
      || answer.length > optionsMax) {
      return false;
    }
    return true;
  }

  onAnswer = (optionIndex) => {
    const { answer, onChange, config } = this.props;
    if (!answer || (config.optionsMax === 1 && config.optionsMin === 1)) {
      onChange([optionIndex]);
    } else if (answer.includes(optionIndex)) {
      const answerIndex = answer.indexOf(optionIndex);
      onChange(R.remove(answerIndex, 1, answer));
    } else {
      onChange(R.append(optionIndex, answer));
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
              onPress={() => this.onAnswer(idx)}
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
};
