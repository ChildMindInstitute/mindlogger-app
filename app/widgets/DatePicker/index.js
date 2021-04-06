import React from 'react';
import PropTypes from 'prop-types';
import { Text, ListItem, Left, Right, Icon , Item , Input } from 'native-base';
import { View, ScrollView,KeyboardAvoidingView, TextInput, Platform } from 'react-native';
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

  finalAnswer = {};

  handleComment = (itemValue) => {
    const {onChange} = this.props;
    this.finalAnswer["text"] = itemValue;

    onChange(this.finalAnswer);
  }


  setShowPicker(visible) {
    this.setState({ show: visible });
  }

  onChangeDate (event, selectedDate) {
    const { onChange } = this.props;
    if (Platform.OS == 'ios') {

      this.finalAnswer["value"] =
      {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
        day: selectedDate.getDate()
      }
      onChange(this.finalAnswer);
    } else {
      this.setShowPicker(false);

      if (event.type == 'set') {
        this.finalAnswer["value"] =
        {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth(),
          day: selectedDate.getDate()
        }
        onChange(this.finalAnswer);
      }
    }
  }

  render() {
    const { value , isOptionalText } = this.props;
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
        {isOptionalText ?
          (<View style={{
            marginTop: '8%' ,
            width: '100%' ,
          }}
          >
        <Item bordered
          style={{borderWidth: 1}}
        >
          <TextInput
              style={{
                width: '100%',
                ... Platform.OS !== 'ios' ? {} : { maxHeight: 100 }
              }}
              placeholder = "Please enter the text"
              onChangeText={text=>this.handleComment(text)}
              value={this.finalAnswer["text"]}
              multiline={true}
          />
        </Item>
      </View>
    ):<View></View>
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

