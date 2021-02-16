import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18next';
import { View, Image, StyleSheet, Alert } from 'react-native';
import { ListItem, Text } from 'native-base';
import { CheckBox } from 'react-native-elements';
import { colors } from '../themes/colors';
import { getURL } from '../services/helper';

const styles = StyleSheet.create({
  prizesHeaderText: {
    fontSize: 20,
  },
});

export const RadioPrizes = ({ value, config, onChange, selected, onSelected, tokenBalance }) => {
  const handlePress = (item) => {
    const { value, price } = item;
    if (price > tokenBalance) {
      Alert.alert(
        i18n.t('prize:lack_tokens_title'),
        i18n.t('prize:lack_tokens_subtitle'),
        [
          {
            text: 'OK',
            style: 'Ok',
          },
        ],
      );
      return;
    }
    if (!selected) {
      onSelected(true);
      onChange(value);
    }
  };

  return (
    <View style={{ alignItems: 'stretch' }}>
      <ListItem>
        <View style={{ width: '70%' }}>
          <Text style={styles.prizesHeaderText}>Prizes</Text>
        </View>
        <View style={{ width: '30%' }}>
          <Text style={styles.prizesHeaderText}>Tokens</Text>
        </View>
      </ListItem>
      {config.itemList.map((item, index) => (
        <ListItem
          onPress={() => handlePress(item)}
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
                checked={value === (item.value)}
                onPress={() => handlePress(item)}
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
            <Text>{item.price}</Text>
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
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  tokenBalance: PropTypes.number.isRequired,
};
