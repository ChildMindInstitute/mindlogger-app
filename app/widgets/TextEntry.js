import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Item, Input } from 'native-base';
import i18n from 'i18next';

export const TextEntry = ({ value = '', onChange, ...props }) => (
  <View {...props}>
    <Item>
      <Input
        placeholder={i18n.t('text_entry:type_placeholder')}
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
