import React from 'react';
import PropTypes from 'prop-types';
import { View, Picker, ScrollView, KeyboardAvoidingView, Text } from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
import { OptionalText } from '../OptionalText';

const defaultTime = { hour: 0, minute: 0 };

export class TimeDuration extends React.Component {

  finalAnswer = {};

  handleComment = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }


  // onChangeFrom = (newFromVal) => {
  //   const { onChange } = this.props;


  //   this.finalAnswer["value"] = {
  //     from: newFromVal,
  //     to: this.finalAnswer["value"] ? this.finalAnswer["value"].to : defaultTime,
  //   };

  //   onChange(this.finalAnswer);

  // }

  // onChangeTo = (newToVal) => {
  //   const { onChange } = this.props;

  //   this.finalAnswer["value"] = {
  //     from: this.finalAnswer["value"] ? this.finalAnswer["value"].from : defaultTime,
  //     to: newToVal,
  //   };
  //   onChange(this.finalAnswer);

  // }

  renderDuration = (type) => {
    let items;

    console.log('type---------------', type)

    if (type === 'hours') {
      items = new Array(24).fill(0).map((val, index) => {
        return { label: index, value: index }
      });
    } else if (type === 'mins') {
      items = new Array(60).fill(0).map((val, index) => {
        return { label: index, value: index }
      });
    } else if (type === 'secs') {
      items = new Array(60).fill(0).map((val, index) => {
        return { label: index, value: index }
      });
    } else {
      items = new Array(100).fill(0).map((val, index) => {
        return { label: index, value: index }
      });
    }

    console.log('items---------', items)

    return (
      <Picker onValueChange={(v) => console.log(v)}>
        <Picker.Item label="Select one" value={items.value} />
        {items.map((item, index) => (
          <Picker.Item label={item.label + ''} value={item.value} key={index} />
        ))}
      </Picker>
    );
  }

  render() {
    const { value, config, isOptionalText, isOptionalTextRequired } = this.props;
    const valueTypes = config.timeDuration.split(' ');

    console.log('valueTypes------------', valueTypes);

    this.finalAnswer = value ? value : {};

    const safeValue = this.finalAnswer["value"] || {
      from: defaultTime,
      to: defaultTime,
    };

    this.finalAnswer["value"] = safeValue ? safeValue : [];

    return (
      <KeyboardAvoidingView>
        <View style={{ alignItems: 'stretch' }}>
          
          {valueTypes && Object.keys(valueTypes).map(type => 
            // {valueTypes[type] !== "" && 
              <View>
                <Text>
                  {valueTypes[type]}
                </Text>
                {this.renderDuration(valueTypes[type])}
              </View>
            // }
          )}
          
          {isOptionalText &&
            <OptionalText
              onChangeText={text => this.handleComment(text)}
              value={this.finalAnswer["text"]}
              isRequired={isOptionalTextRequired}
            />
          }
        </View>
      </KeyboardAvoidingView>
    );
  }
}

TimeDuration.defaultProps = {
  value: undefined,
};

TimeDuration.propTypes = {
  config: PropTypes.object.isRequired,
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
