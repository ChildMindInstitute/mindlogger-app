import React from 'react';
import PropTypes from 'prop-types';
import { View, Picker, Dimensions, KeyboardAvoidingView, Text } from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
import { OptionalText } from '../OptionalText';

const defaultTime = { hour: 0, minute: 0 };
const { width } = Dimensions.get('window');

export class TimeDuration extends React.Component {

  finalAnswer = {};

  handleComment = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }

  capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  onChangeValue = (type, value) => {
    const { onChange } = this.props;

    this.finalAnswer[type] = value;
    onChange(this.finalAnswer);
  }

  renderDuration = (type) => {
    let items;
    const { finalAnswer, onChangeValue } = this;

    if (type === 'hours') {
      items = new Array(23).fill(0).map((val, index) => {
        return { label: index + 1, value: index + 1 }
      });
    } else if (type === 'mins') {
      items = new Array(59).fill(0).map((val, index) => {
        return { label: index + 1, value: index + 1 }
      });
    } else if (type === 'secs') {
      items = new Array(59).fill(0).map((val, index) => {
        return { label: index + 1, value: index + 1 }
      });
    } else {
      items = new Array(99).fill(0).map((val, index) => {
        return { label: index + 1, value: index + 1 }
      });
    }

    return (
      <Picker selectedValue={finalAnswer[type] || ''} onValueChange={(v) => onChangeValue(type, v)} style={width < 800 ? { width: 102 } : {}}>
        <Picker.Item label={this.capitalizeFirstLetter(type)} value={items.value} />
        {items.map((item, index) => (
          <Picker.Item label={item.label + ''} value={item.value} key={index} />
        ))}
      </Picker>
    );
  }

  render() {
    const { value, config, isOptionalText, isOptionalTextRequired } = this.props;
    const valueTypes = config.timeDuration.split(' ');

    this.finalAnswer = value ? value : {};

    const safeValue = this.finalAnswer["value"] || {
      from: defaultTime,
      to: defaultTime,
    };

    this.finalAnswer["value"] = safeValue ? safeValue : [];

    return (
      <KeyboardAvoidingView>
        <View style={{ alignItems: 'stretch', flexDirection: 'row', flex: 1, marginLeft: width < 800 ? -10 : 0, marginRight: width < 800 ? -10 : 0 }}>
          {valueTypes && Object.keys(valueTypes).map(type =>
            <>
              {valueTypes[type] !== "" &&
                <View style={{ flex: 1 }}>
                  {this.renderDuration(valueTypes[type])}
                </View>
              }
            </>
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
  value: {},
};

TimeDuration.propTypes = {
  config: PropTypes.object.isRequired,
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
