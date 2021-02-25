import React from 'react';
import PropTypes from 'prop-types';
import { Text, ListItem, Left, Right, Icon } from 'native-base';
import { View } from 'react-native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

export class DatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };

    this.onChangeDate = this.onChangeDate.bind(this);
  }

  setShowPicker(visible) {
    this.setState({ show: visible });
  }

  onChangeDate (event, selectedDate) {
    const { onChange } = this.props;
    if (Platform.OS == 'ios') {
      onChange({
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
        day: selectedDate.getDate()
      });
    } else {
      this.setShowPicker(false);
  
      if (event.type == 'set') {
        onChange({
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth(),
          day: selectedDate.getDate()
        })
      }
    }
  }

  render() {
    const { value } = this.props;
    const date = value ? new Date(value.year, value.month, value.day) : new Date();

    if (value) {
      date.setHours(value.hour || 0);
      date.setMinutes(value.minute || 0);
    } else {
      date.setHours(0);
      date.setMinutes(0);
    }

    return (
      <View style={{ marginBottom: 20 }}>
        <ListItem
          onPress={() => {
            this.setShowPicker(!this.state.show);
          }}
        >
          <Left>
            <Text>{moment(date).format('LL')}</Text>
          </Left>
          <Right>
            <Icon name="arrow-forward" />
          </Right>
        </ListItem>

        { this.state.show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={'date'}
            is24Hour={true}
            display="default"
            onChange={this.onChangeDate}
          />
        )}

      </View>
    );
  }
}

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
