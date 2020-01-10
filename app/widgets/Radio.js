import React from 'react';
import PropTypes from 'prop-types';
import { View, Image } from 'react-native';
import {
  ListItem,
  Right,
  Body,
  Text,
} from 'native-base';
import { CheckBox } from 'react-native-elements';
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
            <CheckBox
              checked={value === item.value}
              onPress={() => onChange(item.value)}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checkedColor={colors.primary}
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
