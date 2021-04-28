import React from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView,KeyboardAvoidingView, TextInput, Platform } from 'react-native';
import {Item , Input } from 'native-base';
import TimePicker from './TimePicker';
import { OptionalText } from '../OptionalText';

const defaultTime = { hour: 0, minute: 0 };

export class TimeRange extends React.Component {

  finalAnswer = {};

  handleComment = (itemValue) => {
    const {onChange} = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }


  onChangeFrom = (newFromVal) => {
    const { onChange} = this.props;


    this.finalAnswer["value"] = {
      from: newFromVal,
      to: this.finalAnswer["value"] ? this.finalAnswer["value"].to : defaultTime,
    };

    onChange(this.finalAnswer);

  }

  onChangeTo = (newToVal) => {
    const { onChange } = this.props;

    this.finalAnswer["value"] = {
      from: this.finalAnswer["value"] ? this.finalAnswer["value"].from : defaultTime,
      to: newToVal,
    };
    onChange(this.finalAnswer);

  }

  render() {
    const { value ,isOptionalText, isOptionalTextRequired } = this.props;

    this.finalAnswer = value ? value : {};

    const safeValue = this.finalAnswer["value"] || {
      from: defaultTime,
      to: defaultTime,
    };

    this.finalAnswer["value"] = safeValue ? safeValue :[];

    return (
      <KeyboardAvoidingView>
      <View style={{ alignItems: 'stretch' }}>
        <TimePicker value={this.finalAnswer["value"].from} onChange={this.onChangeFrom} label="From" />
        <TimePicker value={this.finalAnswer["value"].to} onChange={this.onChangeTo} label="To" />
        {isOptionalText &&
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

TimeRange.defaultProps = {
  value: undefined,
};

TimeRange.propTypes = {
  value: PropTypes.shape({
    from: PropTypes.object,
    to: PropTypes.object,
  }),
  onChange: PropTypes.func.isRequired,
};
