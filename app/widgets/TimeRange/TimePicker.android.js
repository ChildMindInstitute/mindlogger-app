import React from 'react';
import PropTypes from 'prop-types';
import { Text, ListItem, Left, Right, Icon } from 'native-base';
import { TimePickerAndroid, StyleSheet, View } from 'react-native';
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

const openTimePicker = (initialValue, callback) => {
  TimePickerAndroid.open({
    hour: initialValue.hour,
    minute: initialValue.minute,
    is24Hour: false,
  }).then(({ action, hour, minute }) => {
    if (action !== TimePickerAndroid.dismissedAction) {
      callback({
        hour,
        minute,
      });
    }
  });
};

const TimePicker = ({ onChange, value = {}, label }) => {
  const date = new Date();
  date.setHours(value.hour || 0);
  date.setMinutes(value.minute || 0);
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>
      <ListItem
        onPress={() => {
          openTimePicker(value, onChange);
        }}
      >
        <Left>
          <Text>{moment(date).format('h:mm a')}</Text>
        </Left>
        <Right>
          {label === 'From' ? <Icon type="FontAwesome" name="bed" /> : <Icon type="Ionicons" name="md-alarm" />}
        </Right>
      </ListItem>
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
