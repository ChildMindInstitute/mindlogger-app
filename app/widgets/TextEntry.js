import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Item, Input } from 'native-base';
import i18n from 'i18next';

export const TextEntry = ({ value = '', onChange, valueType, ...props }) => (
  <View {...props}>
    <Item>
      <Input
        placeholder={i18n.t('text_entry:type_placeholder')}
        onChangeText={onChange}
        keyboardType={valueType && valueType.includes('integer') ? `numeric` : `default`}
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
  valueType: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
