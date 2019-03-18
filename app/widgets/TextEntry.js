import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Text, Item, Input } from 'native-base';

const TextEntry = ({ answer, config = {}, onChange, ...props }) => (
  <View {...props}>
    {config.display && (
      <Text>{config.label}</Text>
    )}
    <Item>
      <Input
        placeholder="Please type text"
        onChangeText={onChange}
        value={answer}
      />
    </Item>
  </View>
);

TextEntry.defaultProps = {
  answer: '',
};

TextEntry.propTypes = {
  answer: PropTypes.string,
  config: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TextEntry;
