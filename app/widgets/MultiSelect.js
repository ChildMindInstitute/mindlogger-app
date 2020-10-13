import React, { Component } from 'react';
import { View, Image } from 'react-native';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { ListItem, Text } from 'native-base';
import { CheckBox } from 'react-native-elements';
import { getURL } from '../services/helper';
import { colors } from '../themes/colors';

export class MultiSelect extends Component {
  static isValid(value = [], { minValue = 1, maxValue = Infinity }) {
    if (!value || value.length < minValue || value.length > maxValue) {
      return false;
    }
    return true;
  }

  onAnswer = (itemVal) => {
    const { value, onChange, config } = this.props;
    if (!value || (config.maxValue === 1 && config.minValue === 1)) {
      onChange([itemVal]);
    } else if (Array.isArray(value) && value.includes(itemVal)) {
      const answerIndex = value.indexOf(itemVal);
      onChange(R.remove(answerIndex, 1, value));
    } else {
      onChange(R.append(itemVal, value));
    }
  };

  render() {
    const {
      config: { itemList },
      token,
      value = [],
    } = this.props;
    return (
      <View style={{ alignItems: 'stretch' }}>
        {itemList.map((item, index) => (
          <ListItem
            style={{ width: '90%' }}
            onPress={() => this.onAnswer(item.name.en)}
            key={index}
          >
            <View style={{ width: '85%' }}>
              <View style={{ width: '100%', flexDirection: 'row' }}>
                {item.image ? (
                  <Image
                    style={{ width: '20%', height: 64, resizeMode: 'contain' }}
                    source={{ uri: getURL(item.image) }}
                  />
                ) : (
                  <View />
                )}
                {item.image ? (
                  <View
                    style={{
                      marginLeft: '8%',
                      maxWidth: '72%',
                      justifyContent: 'center',
                    }}
                  >
                    <Text>{item.name.en} {token ? (item.value < 0 ? '(-' : '(+' + item.value + ')') : ""}</Text>
                  </View>
                ) : (
                  <View
                    style={{
                      marginLeft: '8%',
                      maxWidth: '92%',
                      justifyContent: 'center',
                    }}
                  >
                      <Text>{item.name.en} {token ? (item.value < 0 ? '(-' : '(+' + item.value + ')') : ""}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={{ width: '15%' }}>
              <CheckBox
                checked={value && Array.isArray(value) && value.includes(item.name.en)}
                onPress={() => this.onAnswer(item.name.en)}
                checkedIcon="check-square"
                uncheckedIcon="square-o"
                checkedColor={colors.primary}
                uncheckedColor={colors.primary}
              />
            </View>
          </ListItem>
        ))}
      </View>
    );
  }
}

MultiSelect.defaultProps = {
  value: undefined,
};

MultiSelect.propTypes = {
  config: PropTypes.shape({
    itemList: PropTypes.array,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
  }).isRequired,
  token: PropTypes.bool,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};
