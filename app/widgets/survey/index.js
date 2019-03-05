import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import SurveyMultiSelector from './SurveyMultiSelector';
import SurveyTableInput from './SurveyTableInput';
import SurveyTableSelector from './SurveyTableSelector';
import SurveySliderInput from './SurveySliderInput';
import SurveyTimeInput from './SurveyTimeInput';
import SurveyAudioInput from './SurveyAudioInput';

const getSurveyElement = (type, mode) => {
  if (type === 'list' && mode === 'single') {
    return SurveyMultiSelector;
  }
  if (type === 'table' && mode !== 'select') {
    return SurveyTableInput;
  }
  if (type === 'table') {
    return SurveyTableSelector;
  }
  if (type === 'slider') {
    return SurveySliderInput;
  }
  if (type === 'time') {
    return SurveyTimeInput;
  }
  if (type === 'audio') {
    return SurveyAudioInput;
  }
  return View;
};

export default class SurveySection extends Component {
  resetData = () => {
    const { type } = this.props;
    if (this.surveyEl && type === 'audio') {
      this.surveyEl.reset();
    }
  }

  render() {
    const {
      type,
      config,
      answer,
      onChange,
      onNextChange,
    } = this.props;
    const SurveyElement = getSurveyElement(type, config.mode);
    return (
      <SurveyElement
        config={config}
        answer={answer}
        onChange={onChange}
        onNextChange={onNextChange}
        ref={(ref) => { this.surveyEl = ref; }}
      />
    );
  }
}

SurveySection.defaultProps = {
  onNextChange: undefined,
};

SurveySection.propTypes = {
  type: PropTypes.string.isRequired,
  config: PropTypes.shape({
    mode: PropTypes.string,
  }).isRequired,
  answer: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  onNextChange: PropTypes.func,
};
