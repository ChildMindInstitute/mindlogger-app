import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import WidgetError from './WidgetError';

import {
  View,
} from "react-native";
import {
  AudioImageRecord,
  AudioRecord,
  AudioStimulus,
  Camera,
  DatePicker,
  AgeSelector,
  Drawing,
  Geolocation,
  MultiSelect,
  Radio,
  Select,
  Slider,
  TableInput,
  TextEntry,
  TimeRange,
  VisualStimulusResponse,
  RadioPrizes,
  StackedSlider,
  StackedRadio,
  StabilityTracker,
} from '../../widgets';
import ABTrails from '../../widgets/ABTrails';
import TimePicker from '../../widgets/TimeRange/TimePicker';
import { setSelected } from '../../state/responses/responses.actions';
import { currentAppletSelector } from '../../state/app/app.selectors';
import {
  currentAppletTokenBalanceSelector,
} from "../../state/responses/responses.selectors";

// const TOKEN_LOGGER_SCHEMA = 'https://raw.githubusercontent.com/ChildMindInstitute/TokenLogger_applet/master/protocols/TokenLogger/TokenLogger_schema';

const Widget = ({
  screen,
  answer,
  onChange,
  applet,
  isCurrent,
  currentScreen,
  isSelected,
  setSelected,
  onPress,
  onRelease,
  onContentError,
  appletTokenBalance
}) => {
  const valueType = R.path(['valueConstraints', 'valueType'], screen);

  if (screen.inputType === 'radio'
    // && Array.isArray(answer)
    && R.path(['valueConstraints', 'multipleChoice'], screen) === true) {
    const screenValue = (typeof answer === 'object') ? answer : undefined;
    return (
      <MultiSelect
        config={screen.valueConstraints}
        onChange={onChange}
        value={screenValue}
        token={valueType && valueType.includes('token')}
      />
    );
  }
  if (screen.inputType === 'radio'
    // && Array.isArray(answer)
    && R.path(['valueConstraints', 'itemList'], screen)) {
    return (
      <Radio
        config={screen.valueConstraints}
        onChange={onChange}
        onSelected={setSelected}
        value={answer}
        selected={isSelected}
        token={valueType && valueType.includes("token")}
      />
    );
  }

  if (screen.inputType == 'stabilityTracker') {
    return (
      <StabilityTracker
        onChange={onChange}
        config={screen.inputs}
        isCurrent={isCurrent}
      />
    )
  }

  if (screen.inputType === 'stackedRadio') {
    return (
      <StackedRadio
        config={screen.valueConstraints}
        onChange={onChange}
        onSelected={setSelected}
        value={answer}
        token={valueType && valueType.includes("token")}
      />
    )
  }

  if (screen.inputType === 'slider') {
    return (
      <Slider
        config={screen.valueConstraints}
        appletName={applet.name.en}
        onChange={onChange}
        onPress={onPress}
        onRelease={onRelease}
        value={answer}
      />
    );
  }
  if (screen.inputType === 'trail') {
    return (
      <ABTrails
        screen={screen.variableName}
        currentScreen={currentScreen}
        data={answer}
        onChange={onChange}
      />
    )
  }
  if (screen.inputType === 'stackedSlider') {
    return (
      <StackedSlider
        config={screen.valueConstraints}
        appletName={applet.name.en}
        onChange={onChange}
        onPress={onPress}
        onRelease={onRelease}
        value={answer}
      />
    );
  }
  if (screen.inputType === 'timeRange') {
    return (
        <TimeRange
       config={screen.valueConstraints}
        onChange={onChange}
        value={answer}
        isOptionalText = {screen.isOptionalText}
        isOptionalTextRequired = {screen.valueConstraints.isOptionalTextRequired || false}
      />
    );
  }
  if (screen.inputType === 'date') {
    return (
      <DatePicker
        config={screen.valueConstraints}
        onChange={onChange}
        value={answer}
        isOptionalText = {screen.isOptionalText}
        isOptionalTextRequired = {screen.valueConstraints.isOptionalTextRequired || false}
      />
    );
  }
  if (screen.inputType === 'ageSelector') {
    return (
      <AgeSelector
        config={screen.valueConstraints}
        onChange={onChange}
        value={answer}
        isOptionalText = {screen.isOptionalText}
        isOptionalTextRequired = {screen.valueConstraints.isOptionalTextRequired || false}
      />
    );
  }
  if (screen.inputType === 'select'
    && R.path(['valueConstraints', 'itemList'], screen)) {
    return (
      <Select
        onChange={onChange}
        value={answer}
        config={screen.valueConstraints}
      />
    );
  }
  if (screen.inputType === 'text') {
    return (
      <TextEntry
        onChange={onChange}
        value={answer}
        valueType={screen.valueConstraints.valueType}
      />
    );
  }
  if (screen.inputType === 'audioRecord' || screen.inputType === 'audioPassageRecord') {
    return (
      <AudioRecord
        onChange={onChange}
        config={screen.valueConstraints}
        value={answer}
        isOptionalText = {screen.isOptionalText}
        isOptionalTextRequired = {screen.valueConstraints.isOptionalTextRequired || false}
      />
    );
  }
  if (screen.inputType === 'audioImageRecord'
    && R.path(['valueConstraints', 'image'], screen)) {
    return (
      <AudioImageRecord
        onChange={onChange}
        config={screen.valueConstraints}
        value={answer}
      />
    );
  }
  if (screen.inputType === 'audioStimulus') {
    return (
      <AudioStimulus
        value={answer}
        onChange={onChange}
        config={screen.inputs}
        isCurrent={isCurrent}
      />
    );
  }
  if (screen.inputType === 'photo') {
    return (
      <Camera
        value={answer}
        onChange={onChange}
        config={screen.inputs}
        isOptionalText = {screen.isOptionalText}
        isOptionalTextRequired = {screen.valueConstraints.isOptionalTextRequired}
      />
    );
  }
  if (screen.inputType === 'video') {
    return (
      <Camera
        value={answer}
        onChange={onChange}
        config={screen.inputs}
        isOptionalText = {screen.isOptionalText}
        isOptionalTextRequired = {screen.valueConstraints.isOptionalTextRequired}
        video
      />
    );
  }
  if (screen.inputType === 'visual-stimulus-response') {
    return (
      <VisualStimulusResponse
        onChange={onChange}
        config={screen.inputs}
        isCurrent={isCurrent}
      />
    );
  }
  if (screen.inputType === 'drawing') {
    return (
      <Drawing
        config={screen}
        onChange={onChange}
        onPress={onPress}
        onRelease={onRelease}
        isOptionalText = {screen.isOptionalText}
        isOptionalTextRequired = {screen.valueConstraints.isOptionalTextRequired}
        answer={answer}
      />
    );
  }
  if (screen.inputType === 'tableCounter') {
    return (
      <TableInput
        config={screen.inputs}
        onChange={onChange}
        value={answer}
      />
    );
  }
  if (screen.inputType === 'tableText') {
    return (
      <TableInput
        config={screen.inputs}
        onChange={onChange}
        value={answer}
        freeEntry
      />
    );
  }
  if (screen.inputType === 'geolocation') {
    return (
      <Geolocation
        config={screen.valueConstraints}
        value={answer}
        onChange={onChange}
        isOptionalText = {screen.isOptionalText}
        isOptionalTextRequired = {screen.valueConstraints.isOptionalTextRequired || false}
      />
    );
  }
  if (screen.inputType === 'time') {
    const screenValue = (typeof answer === 'object') ? answer : undefined;
    return (
      <TimePicker
        value={screenValue}
        onChange={onChange}
      />
    );
  }
  // markdown items are rendered in ScreenDisplay
  if (screen.inputType === 'markdownMessage') {
    return null;
  }

  if (screen.inputType === 'prize'
    && R.path(['valueConstraints', 'itemList'], screen)) {
    return (
      <RadioPrizes
        config={screen.valueConstraints}
        onChange={onChange}
        onSelected={setSelected}
        value={answer}
        selected={isSelected}
        tokenBalance={appletTokenBalance.cumulativeToken}
      />
    );
  }

  const [oneShot, setOneShot] = useState(false);
  useEffect(() => {
    if (onContentError && !oneShot) {
      setOneShot(true);
      onContentError();
    }
  });

  return <WidgetError />;
};

Widget.defaultProps = {
  answer: undefined,
  onPress: () => {},
  onRelease: () => {},
};

Widget.propTypes = {
  screen: PropTypes.object.isRequired,
  answer: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  applet: PropTypes.object.isRequired,
  onContentError: PropTypes.func.isRequired,
  setSelected: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  currentScreen: PropTypes.number.isRequired,
  onPress: PropTypes.func,
  onRelease: PropTypes.func,
  appletTokenBalance: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  applet: currentAppletSelector(state),
  isSelected: state.responses.isSelected,
  appletTokenBalance: currentAppletTokenBalanceSelector(state),
});

const mapDispatchToProps = {
  setSelected,
};

export default connect(mapStateToProps, mapDispatchToProps)(Widget);
