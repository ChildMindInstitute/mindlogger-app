import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import WidgetError from './WidgetError';
import {
  AudioImageRecord,
  AudioRecord,
  AudioStimulus,
  Camera,
  DatePicker,
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
} from '../../widgets';
import TimePicker from '../../widgets/TimeRange/TimePicker';

const Widget = ({ screen, answer, onChange, isCurrent, onPress, onRelease, onContentError }) => {
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
  if (screen.inputType === 'radio'
    && R.path(['valueConstraints', 'itemList'], screen)) {
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
        onPress={onPress}
        onRelease={onRelease}
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
  if (screen.inputType === 'date') {
    return (
      <DatePicker
        onChange={onChange}
        value={answer}
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
      />
    );
  }
  if (screen.inputType === 'audioRecord' || screen.inputType === 'audioPassageRecord') {
    return (
      <AudioRecord
        onChange={onChange}
        config={screen.valueConstraints}
        value={answer}
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
      />
    );
  }
  if (screen.inputType === 'video') {
    return (
      <Camera
        value={answer}
        onChange={onChange}
        config={screen.inputs}
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
        config={screen.inputs}
        onChange={onChange}
        onPress={onPress}
        onRelease={onRelease}
        value={answer}
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
        value={answer}
        onChange={onChange}
      />
    );
  }
  if (screen.inputType === 'time') {
    return (
      <TimePicker
        value={answer}
        onChange={onChange}
      />
    );
  }
  // markdown items are rendered in ScreenDisplay
  if (screen.inputType === 'markdown-message') {
    return null;
  }

  onContentError();
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
  onContentError: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
  onPress: PropTypes.func,
  onRelease: PropTypes.func,
};

export default Widget;
