import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { CachedImage } from 'react-native-img-cache';
import {
  ListItem,
  Radio as RadioNB,
  Right,
  Body,
  Text,
} from 'native-base';
import { colors } from '../themes/colors';

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


export const Radio = ({ value, config, onChange }) => (
  <View style={{ alignItems: 'stretch' }}>
    {
      config.itemList.map((item, index) => (
        <ListItem onPress={() => onChange(item.value)} key={index}>
          <Body>
            <View style={{flexDirection: 'row'}}>
              { item.image ? <CachedImage style={{ width: 64, height: 64, resizeMode: 'cover' }} source={{ uri: getURL(item.image.en) }} /> : <View></View>}
              <View style={{justifyContent: 'center'}}>
                <Text>{item.name.en}</Text>
              </View>
            </View>
          </Body>
          <Right>
            <RadioNB selectedColor={colors.primary} selected={value === item.value} onPress={() => onChange(item.value)} />
          </Right>
        </ListItem>
      ))
    }
  </View>
);

Radio.defaultProps = {
  value: undefined,
};

Radio.propTypes = {
  value: PropTypes.any,
  config: PropTypes.shape({
    itemList: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.object,
      value: PropTypes.any,
      image: PropTypes.object,
    })).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
