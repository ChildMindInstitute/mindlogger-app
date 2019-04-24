import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Content } from 'native-base';
import * as R from 'ramda';
import ScreenDisplay from './ScreenDisplay';
import SurveySection from '../../widgets/survey';
import Radio from '../../widgets/Radio';
import MultiSelect from '../../widgets/MultiSelect';
import Slider from '../../widgets/Slider';
import TimeRange from '../../widgets/TimeRange';

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
  },
  padding: {
    padding: 20,
  },
  paddingContent: {
    padding: 20,
    flexGrow: 1,
  },
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

class Screen extends Component {
  static isValid(answer, screen) {
    const surveyType = R.path(['meta', 'surveyType'], screen);
    if (typeof surveyType !== 'undefined') {
      return SurveySection.isValid(answer, screen.meta.survey, screen.meta.surveyType);
    }
    return !!answer;
  }

  reset() {
    if (this.canvasRef) {
      this.canvasRef.resetData();
    }
    if (this.surveyRef) {
      this.surveyRef.resetData();
    }
  }

  renderWidget() {
    const { screen, answer, onChange } = this.props;
    /*
    const data = screen.meta || {};
    if (data.canvasType) {
      return (
        <CanvasSection
          video={(data.canvasType == 'video')}
          type={((data.canvasType == 'video') ? 'camera' : data.canvasType)}
          config={data.canvas}
          answer={answer}
          onChange={onChange}
          ref={(ref) => { this.canvasRef = ref; }}
          onNextChange={() => { }}
        />
      );
    }
    if (data.surveyType) {
      return (
        <SurveySection
          type={data.surveyType}
          config={data.survey}
          answer={answer}
          onChange={onChange}
          ref={(ref) => { this.surveyRef = ref; }}
          onNextChange={() => { }}
        />
      );
    }
    if (data.textEntry && data.textEntry.display) {
      return (
        <TextEntry
          style={styles.text}
          config={data.textEntry}
          answer={answer ? answer.text : ''}
          onChange={text => onChange({ text })}
        />
      );
    }
    */
    if (screen.inputType === 'radio'
      && R.path(['valueConstraints', 'multipleChoice'], screen) === true) {
      return (
        <MultiSelect
          config={screen.valueConstraints}
          onChange={onChange}
          value={answer}
        />
      );
    }
    if (screen.inputType === 'radio') {
      return (
        <Radio
          config={screen.valueConstraints}
          onChange={onChange}
          value={answer}
        />
      );
    }
    if (screen.inputType === 'slider') {
      return (
        <Slider
          config={screen.valueConstraints}
          onChange={onChange}
          value={answer}
        />
      );
    }
    if (screen.inputType === 'timeRange') {
      return (
        <TimeRange
          onChange={onChange}
          value={answer}
        />
      );
    }
    return <View />;
  }

  render() {
    const { screen } = this.props;
    return (
      <Content
        alwaysBounceVertical={false}
        style={styles.paddingContent}
        contentContainerStyle={{ flex: 1 }}
      >
        <ScreenDisplay screen={screen} />
        {this.renderWidget()}
      </Content>
    );
  }
}

Screen.defaultProps = {
  answer: undefined,
};

Screen.propTypes = {
  screen: PropTypes.object.isRequired,
  answer: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default Screen;
