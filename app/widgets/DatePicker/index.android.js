import React from 'react';
import PropTypes from 'prop-types';
import { Text, ListItem, Left, Right, Icon } from 'native-base';
import { DatePickerAndroid, View } from 'react-native';
import moment from 'moment';

const openDatePicker = (date, callback) => {
  DatePickerAndroid.open({ date }).then(({ action, year, month, day }) => {
    if (action !== DatePickerAndroid.dismissedAction) {
      callback({
        year,
        month,
        day,
      });
    }
  });
};

export const DatePicker = ({ onChange, value }) => {
  const date = value ? new Date(value.year, value.month, value.day) : new Date();
  return (
    <View style={{ marginBottom: 20 }}>
      <ListItem
        onPress={() => {
          openDatePicker(date, onChange);
        }}
      >
        <Left>
          <Text>{moment(date).format('LL')}</Text>
        </Left>
        <Right>
          <Icon name="arrow-forward" />
        </Right>
      </ListItem>
    </View>
  );
};

DatePicker.defaultProps = {
  value: undefined,
};

DatePicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.shape({
    year: PropTypes.number,
    month: PropTypes.number,
    day: PropTypes.number,
  }),
};
