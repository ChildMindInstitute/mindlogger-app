import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import {
  ListItem,
  Radio as RadioNB,
  Right,
  Body,
  Text,
} from 'native-base';
import { colors } from '../themes/colors';

export const Radio = ({ value, config, onChange }) => (
  <View style={{ alignItems: 'stretch' }}>
    {
      config.itemList.map((item, index) => (
        <ListItem onPress={() => onChange(item.value)} key={index}>
          <Body>
            <Text>{item.name.en}</Text>
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
