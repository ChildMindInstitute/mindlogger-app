import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import {
  ListItem,
  Radio,
  Right,
  Body,
  Text,
} from 'native-base';

const RadioWidget = ({ value, config, onChange }) => (
  <View style={{ alignItems: 'stretch' }}>
    {
      config.itemList.map((item, index) => (
        <ListItem onPress={() => onChange(item.value)} key={index}>
          <Body>
            <Text>{item.name.en}</Text>
          </Body>
          <Right>
            <Radio selected={value === item.value} />
          </Right>
        </ListItem>
      ))
    }
  </View>
);

RadioWidget.defaultProps = {
  value: undefined,
};

RadioWidget.propTypes = {
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

export default RadioWidget;
