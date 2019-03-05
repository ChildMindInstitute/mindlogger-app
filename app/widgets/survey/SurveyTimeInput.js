import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Text, Button } from 'native-base';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';

export default class SurveyTimeInput extends Component {
  constructor() {
    super();
    this.state = {
      isDateTimePickerVisible: false,
    };
  }

  showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  handleDatePicked = (date) => {
    const { onChange } = this.props;
    const value = moment(date).format('h:mm a');
    this.hideDateTimePicker();
    onChange(value, true);
  };

  render() {
    const { answer } = this.props;
    return (
      <View style={{ alignItems: 'stretch', flex: 3 }}>
        <Button onPress={this.showDateTimePicker}><Text>{answer || 'Set time'}</Text></Button>
        <DateTimePicker
          mode="time"
          titleIOS="Pick a time"
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked}
          onCancel={this.hideDateTimePicker}
        />
      </View>
    );
  }
}

SurveyTimeInput.propTypes = {
  answer: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
