import React, { useState } from 'react';
import { View, TextInput, Platform} from 'react-native';
import PropTypes from 'prop-types';
import i18n from 'i18next';
import { Item } from 'native-base';

export const OptionalText = ({ isRequired, onChangeText, value }) => {
  const minHeight = 40;
  const [height, setHeight] = useState(minHeight);

  return (
    <View
      style={{
        marginTop: '8%',
        width: '100%' ,
      }}
    >
      <TextInput
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
        onContentSizeChange={(e) => setHeight(Math.max(minHeight, e.nativeEvent.contentSize.height + 15))}
      />
    </View>
  );
};

OptionalText.propTypes = {
  isRequired: PropTypes.bool,
  onChangeText: PropTypes.func.isRequired,
  value: PropTypes.string
};
