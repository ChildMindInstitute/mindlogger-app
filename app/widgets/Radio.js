import React from 'react';
import PropTypes from 'prop-types';
import { View, Image } from 'react-native';
import {
  ListItem,
  Radio as RadioNB,
  Right,
  Body,
  Text,
} from 'native-base';
import { colors } from '../themes/colors';
import { getURL } from '../services/helper';

export const Radio = ({ value, config, onChange }) => (
  <View style={{ alignItems: 'stretch' }}>
    {
      config.itemList.map((item, index) => (
        <ListItem onPress={() => onChange(item.value)} key={index}>
          <Body>
            <View style={{ flexDirection: 'row' }}>
              { item.image
                ? (
                  <Image
                    style={{ width: 64, height: 64, resizeMode: 'cover' }}
                    source={{ uri: getURL(item.image) }}
                  />
                ) : <View />
              }
              <View style={{ justifyContent: 'center' }}>
                <Text>{item.name.en}</Text>
              </View>
            </View>
          </Body>
          <Right>
            <RadioNB
              selectedColor={colors.primary}
              selected={value === item.value}
              onPress={() => onChange(item.value)}
            />
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
      image: PropTypes.string,
    })).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
