import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Slider from '../../components/slider';

export default class SurveySliderInput extends Component {
  componentDidMount() {
    const { answer } = this.props;
    this.onAnswer(answer);
  }

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

SurveySliderInput.propTypes = {
  config: PropTypes.shape({
    options: PropTypes.object,
    optionsCount: PropTypes.number,
    increments: PropTypes.number,
  }).isRequired,
  answer: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onNextChange: PropTypes.func.isRequired,
};
