import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, Platform } from 'react-native';
import { Item, Input } from 'native-base';
import i18n from 'i18next';

export const TextEntry = ({ value = '', onChange, valueType, ...props }) => {
  const [text, setText] = useState(value);
  const [height, setHeight] = useState(36);
  const [focused, setFocused] = useState(false);

  let newStyle = {
    height,
    width: '100%',
    minHeight: 45,
    fontSize: 18
  }

  if (focused && Platform.OS === 'ios') {
    newStyle.maxHeight = 100;
  }

  const updateHeight = (contentHeight) => {
    if (contentHeight !== height && contentHeight >= newStyle.minHeight) {
      if (!text) {
        setHeight(newStyle.minHeight);
      } else {
        setHeight(contentHeight);
      }
    }
  }

  const onEndEditing = () => {
    onChange(text);
    console.log('values', text)
  }

  return (
    <View {...props}>
      <Item>
        <TextInput
          placeholder={i18n.t('text_entry:type_placeholder')}
          onChangeText={setText}
          onEndEditing={onEndEditing}
          style={[newStyle]}
          keyboardType={valueType && valueType.includes('integer') ? `numeric` : `default`}
          value={text}
          multiline={true}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          onContentSizeChange={(e) => updateHeight(e.nativeEvent.contentSize.height)}
        />
      </Item>
    </View>
  )
};

TextEntry.defaultProps = {
  value: '',
};

TextEntry.propTypes = {
  value: PropTypes.string,
  valueType: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
