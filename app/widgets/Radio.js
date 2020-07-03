import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Image } from 'react-native';
import { ListItem, Text } from 'native-base';
import { CheckBox } from 'react-native-elements';
import { colors } from '../themes/colors';
import { getURL } from '../services/helper';

export const Radio = ({ value, config, onChange, selected, onSelected }) => {

  const handlePress = (itemValue) => {
    if (!selected) {
      onSelected(true);
      onChange(itemValue);
    }
  };

  return (
    <View style={{ alignItems: 'stretch' }}>
      {config.itemList.map((item, index) => (
        <ListItem
          style={{ width: '90%' }}
          onPress={() => handlePress(item.value)}
          key={index}
        >
          <View style={{ width: '85%' }}>
            <View style={{ width: '100%', flexDirection: 'row' }}>
              {item.image ? (
                <Image
                  style={{ width: '20%', height: 64, resizeMode: 'contain' }}
                  source={{ uri: getURL(item.image) }}
                />
              ) : (
                <View />
              )}
              {item.image ? (
                <View
                  style={{
                    marginLeft: '8%',
                    maxWidth: '72%',
                    justifyContent: 'center',
                  }}
                >
                  <Text>{item.name.en}</Text>
                </View>
              ) : (
                <View
                  style={{
                    marginLeft: '8%',
                    maxWidth: '92%',
                    justifyContent: 'center',
                  }}
                >
                  <Text>{item.name.en}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ width: '15%' }}>
            <CheckBox
              checked={value === item.value}
              onPress={() => handlePress(item.value)}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checkedColor={colors.primary}
            />
          </View>
        </ListItem>
      ))}
    </View>
  );
};

Radio.defaultProps = {
  value: undefined,
};

Radio.propTypes = {
  value: PropTypes.any,
  config: PropTypes.shape({
    itemList: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.object,
        value: PropTypes.any,
        image: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
  onSelected: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};
