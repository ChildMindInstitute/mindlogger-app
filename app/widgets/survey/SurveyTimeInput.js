import React, {Component} from 'react';
import {View} from 'react-native';
import { Text, Button } from 'native-base';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';

export default class SurveyTimeInput extends Component {
  state = {}
  constructor(props) {
    super(props);
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = (date) => {
    console.log('A date has been picked: ', date);
    const value = moment(date).format("h:mm a")
    this._hideDateTimePicker();
    const {onChange} = this.props;
    onChange(value, true);
  };

  render() {
    const { answer} = this.props;
    return (
      <View style={{alignItems:'stretch', flex: 3}}>
        <Button onPress={this._showDateTimePicker}><Text>{answer || "Set time"}</Text></Button>
        <DateTimePicker
          mode="time"
          titleIOS="Pick a time"
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
        />
      </View>
    )
  }
}
