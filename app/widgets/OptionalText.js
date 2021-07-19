import React, { useState } from 'react';
import { View, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import PropTypes from 'prop-types';
import i18n from 'i18next';
import { Item } from 'native-base';

export const OptionalText = (props) => {
  const { isRequired, value, onChangeText } = props;
  const minHeight = 40;

  const [height, setHeight] = useState(minHeight);

  const updateHeight = (contentHeight) => {
    if (contentHeight !== height && contentHeight >= minHeight) {
      setHeight(contentHeight);
    }
  }

  const textInputItem = (<TextInput
    style={{
      width: '100%',
      ... Platform.OS !== 'ios' ? { height } : {
        maxHeight: 100,
        minHeight: 40,
        height,
        borderBottomWidth: 1,
        borderBottomColor: 'grey'
      },
    }}
    placeholder = {
      i18n.t(isRequired ? 'optional_text:required' : 'optional_text:enter_text')
    }
    onChangeText={onChangeText}
    value={value}
    multiline={true}
    onContentSizeChange={(e) => updateHeight(e.nativeEvent.contentSize.height + 15)}
  />);

  if (Platform.OS == 'ios') {
    return (
        <View
          style={{
            marginTop: '8%',
            width: '100%' ,
          }}
        >
          <Item>
            { textInputItem }
          </Item>
        </View>
    );
  }

  return (
    <View
      style={{
        marginTop: '8%',
        width: '100%' ,
      }}
    >
      { 
        Platform.OS == 'ios' && (<Item>
          { textInputItem }
        </Item>) || textInputItem
      }
    </View>
  );
};

OptionalText.propTypes = {
  isRequired: PropTypes.bool,
  onChangeText: PropTypes.func.isRequired,
  value: PropTypes.string
};
