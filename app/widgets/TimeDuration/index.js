import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, StyleSheet, TextInput } from 'react-native';
import { View } from 'native-base';
import { OptionalText } from '../OptionalText';

const defaultTime = { hour: 0, minute: 0 };

export class TimeDuration extends React.Component {

  finalAnswer = {};

  handleComment = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }

  getItemLabel = (item, type) => {
    if (this.finalAnswer[type] === item.value) {
      return item.label + ' ' + this.capitalizeFirstLetter(type);
    }
    return item.label + '';
  }

  isTimeType = (type) => {
    if (type === 'hours' || type === 'mins' || type === 'secs') {
      return true;
    }
    return false;
  }

  capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  onChangeValue = (type, value) => {
    const { onChange } = this.props;

    this.finalAnswer[type] = value;
    onChange(this.finalAnswer);
  }

  renderDuration = (type, index) => { 
    return (
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          style={styles.input}
          placeholder={this.capitalizeFirstLetter(type)}
          onChangeText={(v) => this.onChangeValue(type, v)}
          keyboardType="numeric"
          value={this.finalAnswer[type]}
        />
      </View>
    );
  }

  render() {
    const { value, config, isOptionalText, isOptionalTextRequired } = this.props;
    const valueTypes = config.timeDuration.split(' ').filter(type => type !== '');

    this.finalAnswer = value ? value : {};

    const safeValue = this.finalAnswer["value"] || {
      from: defaultTime,
      to: defaultTime,
    };

    this.finalAnswer["value"] = safeValue ? safeValue : [];

    return (
      <KeyboardAvoidingView>
        <View>
          <View style={{ alignItems: 'stretch', flexDirection: 'row', flex: 1 }}>
            {valueTypes && Object.keys(valueTypes).map((type, index) =>
              <>
                {!this.isTimeType(valueTypes[type]) &&
                  <View style={{ flex: 1 }}>
                    {this.renderDuration(valueTypes[type], index)}
                  </View>
                }
              </>
            )}
          </View>
          <View style={{ alignItems: 'stretch', flexDirection: 'row', flex: 1 }}>
            {valueTypes && Object.keys(valueTypes).map((type, index) =>
              <>
                {this.isTimeType(valueTypes[type]) &&
                  <View style={{ flex: 1 }}>
                    {this.renderDuration(valueTypes[type], index)}
                  </View>
                }
              </>
            )}
          </View>
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

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 4,
    borderWidth: 1,
    borderColor: '#505050',
    borderRadius: 4,
    padding: 12,
  },
});

TimeDuration.defaultProps = {
  value: {},
};

TimeDuration.propTypes = {
  config: PropTypes.object.isRequired,
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
