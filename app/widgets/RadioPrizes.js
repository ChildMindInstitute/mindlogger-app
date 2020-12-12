import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Image, StyleSheet } from 'react-native';
import { ListItem, Text } from 'native-base';
import { CheckBox } from 'react-native-elements';
import { colors } from '../themes/colors';
import { getURL } from '../services/helper';

const styles = StyleSheet.create({
  prizesHeaderText: {
    fontSize: 20,
  },
});

export const RadioPrizes = ({ value, config, onChange, token ,selected, onSelected }) => {
  const handlePress = (itemValue) => {
    if (!selected) {
      onSelected(true);
      onChange(itemValue);
    }
  };

  return (
    <View style={{ alignItems: 'stretch' }}>
      <ListItem>
        <View style={{ width: '80%' }}>
          <Text style={styles.prizesHeaderText}>Prizes</Text>
        </View>
        <View style={{ width: '20%' }}>
          <Text style={styles.prizesHeaderText}>Tokens</Text>
        </View>
      </ListItem>
      {config.itemList.map((item, index) => (
        <ListItem
          onPress={() => handlePress(token ? item.name.en : item.value)}
          key={index}
        >
          <View style={{ width: '80%' }}>
            <View style={{ width: '100%', flexDirection: 'row' }}>
              {item.image ? (
                <Image
                  style={{ width: '20%', height: 64, resizeMode: 'contain' }}
                  source={{ uri: getURL(item.image) }}
                />
              ) : (
                <View />
              )}
              <CheckBox
                checked={value === (token ? item.name.en : item.value)}
                onPress={() => handlePress(token ? item.name.en : item.value)}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor={colors.primary}
              />
              {item.image ? (
                <View
                  style={{
                    maxWidth: '70%',
                    justifyContent: 'center',
                  }}
                >
                  <Text>{item.name.en}</Text>
                </View>
              ) : (
                <View
                  style={{
                    maxWidth: '90%',
                    justifyContent: 'center',
                  }}
                >
                  <Text>{item.name.en}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ width: '20%' }}>
            <Text>{item.value}</Text>
          </View>
        </ListItem>
      ))}
    </View>
  );
};

RadioPrizes.defaultProps = {
  value: undefined,
};

RadioPrizes.propTypes = {
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
  token: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};
