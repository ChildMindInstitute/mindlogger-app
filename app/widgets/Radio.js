import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { View, Image ,KeyboardAvoidingView,ScrollView, TextInput, Platform} from 'react-native';
import { ListItem, Text, Item , Input} from 'native-base';
import { CheckBox } from 'react-native-elements';
import { colors } from '../themes/colors';
import { getURL } from '../services/helper';
import { TooltipBox } from './TooltipBox';
import { OptionalText } from './OptionalText';
import { connect } from "react-redux";
import questionMark from "../../img/question-mark.png";

import {
  currentScreenSelector,
} from "../state/responses/responses.selectors";

const RadioScreen = ({ value, config, onChange, token ,selected, onSelected, currentScreen }) => {

  let finalAnswer = value ? value : {};

  const shuffle = (list) => {
    return [...list].sort(() => Math.random() - 0.5)
  };

  const [itemOrder, setItemOrder] = useState(
    config.randomizeOptions ? shuffle(config.itemList) : config.itemList
  );

  useEffect(() => {
    if (config.randomizeOptions) {
      setItemOrder(shuffle(config.itemList));
    }
  }, [currentScreen]);

  const handlePress = (itemValue) => {
   // if (!selected) {
      finalAnswer["value"] = itemValue;
      onSelected(true);
      onChange(finalAnswer);
    //}
  };

  const handleComment = (itemValue) => {
    finalAnswer["text"] = itemValue;
    onChange(finalAnswer);
  }

  const invertColor = (hex) => {
    let hexcolor = hex.replace("#", "");
    let r = parseInt(hexcolor.substr(0, 2), 16);
    let g = parseInt(hexcolor.substr(2, 2), 16);
    let b = parseInt(hexcolor.substr(4, 2), 16);
    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#333333' : 'white';
  }

  return (
    <KeyboardAvoidingView>
      <View style={{ alignItems: 'stretch' }}>
        {
          itemOrder.map((item, index) => (
            <ListItem
              style={{ width: '90%', backgroundColor: config.colorPalette ? item.color : 'none', borderRadius: 7, margin: 2 }}
              onPress={() => handlePress(token ? item.name.en : item.value)}
              key={index}
            >
              <View style={{ width: '10%', marginRight: "2%", marginLeft: "2%" }}>
                {item.description ? (
                  <TooltipBox text={item.description}>
                    <View style={{ width: 22, height: 22 }}>
                      <Image
                        style={{ width: '100%', height: '100%' }}
                        source={questionMark}
                      />
                    </View>
                  </TooltipBox>
                ) : (
                  <View />
                )}
              </View>
              <View style={{ width: '72%' }}>
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
                        color: config.colorPalette && item.color ? invertColor(item.color) : colors.primary
                      }}
                    >
                      <Text style={{ color: config.colorPalette && item.color ? invertColor(item.color) : '#333333' }}>
                        {item.name.en} {token ? (item.value < 0 ? '(' + item.value + ')' : '(+' + item.value + ')') : ""}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        marginLeft: '8%',
                        maxWidth: '92%',
                        justifyContent: 'center',
                      }}
                    >
                        <Text style={{ color: config.colorPalette && item.color ? invertColor(item.color) : '#333333'}}>
                        {item.name.en} {token ? (item.value < 0 ? '(' + item.value + ')' : '(+' + item.value + ')') : ""}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ width: '14%' }}>
                <CheckBox
                  checked={finalAnswer["value"] === (token ? item.name.en : item.value)}
                  onPress={() => handlePress(token ? item.name.en : item.value)}
                  checkedIcon="dot-circle-o"
                  uncheckedIcon="circle-o"
                  checkedColor={config.colorPalette && item.color ? invertColor(item.color) : colors.primary}
                  uncheckedColor={config.colorPalette && item.color ? invertColor(item.color) : colors.primary}
                />
              </View>
            </ListItem>
          ))
        }

        {
          config.isOptionalText &&
            <OptionalText
              isRequired={config.isOptionalTextRequired}
              value={finalAnswer["text"]}
              onChangeText={text=>handleComment(text)}
            />
        }
      </View>
    </KeyboardAvoidingView>
  );
};

RadioScreen.defaultProps = {
  value: undefined,
};

RadioScreen.propTypes = {
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

const mapStateToProps = (state) => ({
  currentScreen: currentScreenSelector(state),
});

export const Radio = connect(mapStateToProps)(RadioScreen);
