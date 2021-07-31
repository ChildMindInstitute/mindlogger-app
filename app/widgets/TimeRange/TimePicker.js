import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Text, ListItem, Left, Right, Icon } from 'native-base';
import { StyleSheet, View, Platform } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';

import moment from 'moment';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  paddingContent: {
    padding: 20,
    flexGrow: 1,
  },
  datePickerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    color: colors.grey,
  },
});

const TimePicker = ({ onChange, value = {}, label }) => {
  const date = new Date();
  const [show, setShow] = useState(false);

  if (value) {
    date.setHours(value.hour || 0);
    date.setMinutes(value.minute || 0);
  } else {
    date.setHours(0);
    date.setMinutes(0);
  }

  const onChangeTime = (selectedDate) => {
    onChange({
      hour: selectedDate.getHours(),
      minute: selectedDate.getMinutes()
    })
    setShow(false);
  }
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>
      <ListItem
        onPress={() => {
          setShow(!show);
        }}
      >
        <Left>
          <Text>{moment(date).format('h:mm a')}</Text>
        </Left>
        <Right>
          {label === 'From' ? <Icon type="FontAwesome" name="bed" /> : <Icon type="Ionicons" name="md-alarm" />}
        </Right>
      </ListItem>

      <DateTimePicker
        isVisible={show}
        testID="dateTimePicker"
        value={date}
        mode={'time'}
        is24Hour={true}
        display="default"
        onCancel={() => setShow(false)}
        onConfirm={onChangeTime}
      />
    </View>
  );
};

TimePicker.defaultProps = {
  value: undefined,
  label: undefined,
};

TimePicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.shape({
    hour: PropTypes.number,
    minute: PropTypes.number,
  }),
  label: PropTypes.string,
};

export default TimePicker;
