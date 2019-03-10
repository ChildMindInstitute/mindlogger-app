import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Slider from '../../components/slider';

export default class SurveySliderInput extends Component {
  onAnswer = (answer) => {
    const { config: { options }, onNextChange, onChange } = this.props;
    if (answer) {
      const index = Math.floor(answer) - 1;
      onChange(answer, true);
      onNextChange(options[index] && options[index].screen);
    }
  }

  render() {
    const { config: { options, optionsCount, increments }, answer } = this.props;
    return (
      <View style={{ alignItems: 'stretch', flex: 3 }}>
        <Slider
          value={answer || 0}
          min={1}
          max={optionsCount || 100}
          labels={options}
          strict={increments === 'Discrete'}
          barHeight={300}
          selected={typeof answer !== 'undefined'}
          onChange={this.onAnswer}
        />
      </View>
    );
  }
}

SurveySliderInput.defaultProps = {
  answer: undefined,
};

SurveySliderInput.propTypes = {
  config: PropTypes.shape({
    options: PropTypes.array,
    optionsCount: PropTypes.number,
    increments: PropTypes.string,
  }).isRequired,
  answer: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onNextChange: PropTypes.func.isRequired,
};
