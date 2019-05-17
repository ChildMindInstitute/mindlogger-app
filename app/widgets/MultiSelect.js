import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { CachedImage } from 'react-native-img-cache';
import {
  ListItem,
  Text,
  Body,
  Right,
  CheckBox,
} from 'native-base';

/**
 * getURL will replace an SVG image with a JPG image because
 * react-native can't handle SVGs, but web prefers them.
 * @param {String} url 
 */
const getURL = (url) => {
  if (url.endsWith('.svg')) {
    return url.replace('.svg', '.jpg');
  }
  return url;
};

export class MultiSelect extends Component {
  static isValid(value = [], { minValue = 1, maxValue = Infinity }) {
    if (!value
      || value.length < minValue
      || value.length > maxValue) {
      return false;
    }
    return true;
  }

  onAnswer = (itemVal) => {
    const { value, onChange, config } = this.props;
    if (!value || (config.maxValue === 1 && config.minValue === 1)) {
      onChange([itemVal]);
    } else if (value.includes(itemVal)) {
      const answerIndex = value.indexOf(itemVal);
      onChange(R.remove(answerIndex, 1, value));
    } else {
      onChange(R.append(itemVal, value));
    }
  }

  render() {
    const { config: { itemList }, value = [] } = this.props;
    return (
      <View style={{ alignItems: 'stretch' }}>
        {
          itemList.map((item, index) => (
            <ListItem onPress={() => this.onAnswer(item.value)} key={index}>
              <Body>
                <View style={{flexDirection: 'row'}}>
                  { item.image ? <CachedImage style={{ width: 64, height: 64, resizeMode: 'cover' }} source={{ uri: getURL(item.image.en) }} /> : <View></View>}
                  <View style={{justifyContent: 'center'}}>
                    <Text>{item.name.en}</Text>
                  </View>
                </View>
              </Body>
              <Right>
                <CheckBox
                  checked={value && value.includes(item.value)}
                  onPress={() => this.onAnswer(item.value)}
                />
              </Right>
            </ListItem>
          ))
        }
      </View>
    );
  }
}

MultiSelect.defaultProps = {
  value: undefined,
};

MultiSelect.propTypes = {
  config: PropTypes.shape({
    options: PropTypes.array,
    optionsMax: PropTypes.number,
    optionsMin: PropTypes.number,
  }).isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};
