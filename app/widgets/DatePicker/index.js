import React from 'react';
import PropTypes from 'prop-types';
import { Text, ListItem, Left, Right, Icon , Item , Input } from 'native-base';
import { View, ScrollView,KeyboardAvoidingView } from 'react-native';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { OptionalText } from '../OptionalText';

export class DatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDateTimePickerVisible: false,
    };

    this.onChangeDate = this.onChangeDate.bind(this);
  }

  finalAnswer = {};

  handleComment = (itemValue) => {
    const {onChange} = this.props;
    this.finalAnswer["text"] = itemValue;

    onChange(this.finalAnswer);
  }

  hideDatePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };

  setShowPicker(visible) {
    this.setState({ isDateTimePickerVisible: visible });
  }

  onChangeDate (selectedDate) {
    const { onChange } = this.props;

    this.finalAnswer["value"] = {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
      day: selectedDate.getDate()
    }
    onChange(this.finalAnswer);
    this.setShowPicker(false);
    
  }

  render() {
    const { value , isOptionalText, isOptionalTextRequired } = this.props;
    this.finalAnswer = value ? value : {};

    const date = this.finalAnswer["value"] ? new Date(this.finalAnswer["value"].year, this.finalAnswer["value"].month, this.finalAnswer["value"].day) : new Date();

    if (this.finalAnswer["value"]) {
      date.setHours(this.finalAnswer["value"].hour || 0);
      date.setMinutes(this.finalAnswer["value"].minute || 0);
    } else {
      date.setHours(0);
      date.setMinutes(0);
    }

    /*this.finalAnswer["value"] = date ? date :[];*/

    return (
      <KeyboardAvoidingView>
      <View style={{ marginBottom: 20 }}>
        <ListItem
          onPress={() => {
              this.setShowPicker(!this.state.isDateTimePickerVisible);
          }}
        >
          <Left>
            <Text>{moment(date).format('LL')}</Text>
          </Left>
          <Right>
            <Icon name="arrow-forward" />
          </Right>
        </ListItem>

          <DateTimePicker
            isVisible={this.state.isDateTimePickerVisible}
            testID="dateTimePicker"
            value={date}
            mode={'date'}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            modalStyleIOS={{
              datePicker: {
                justifyContet: 'center',
              }
            }}
            onCancel={this.hideDatePicker}
            onConfirm={this.onChangeDate}
          />
        {
          isOptionalText &&
            <OptionalText
              onChangeText={text=>this.handleComment(text)}
              value={this.finalAnswer["text"]}
              isRequired={isOptionalTextRequired}
            />
        }
      </View>
      </KeyboardAvoidingView>
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

