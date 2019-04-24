import React from 'react';
import PropTypes from 'prop-types';
import { DatePickerIOS } from 'react-native';

const TimePicker = ({ onChange, value = {} }) => {
  const date = new Date();
  date.setHours(value.hour || 0);
  date.setMinutes(value.minute || 0);
  return (
    <DatePickerIOS
      date={date}
      onDateChange={(date) => {
        onChange({
          hour: date.getHours(),
          minute: date.getMinutes(),
        });
      }}
      mode="time"
    />
  );
};

TimePicker.defaultProps = {
  value: undefined,
};

TimePicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.shape({
    from: PropTypes.number,
    to: PropTypes.number,
  }),
};

export default TimePicker;
