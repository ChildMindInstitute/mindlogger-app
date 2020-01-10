import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Item, Input } from 'native-base';

export const TextEntry = ({ value = '', onChange, ...props }) => (
  <View {...props}>
    <Item>
      <Input
        placeholder="Please type text"
        onChangeText={onChange}
        value={value}
      />
    </Item>
  </View>
);

TextEntry.defaultProps = {
  value: '',
};

TextEntry.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
