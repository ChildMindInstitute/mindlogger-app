import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { View, Image ,KeyboardAvoidingView,ScrollView, TextInput, Platform} from 'react-native';
import { ListItem, Text, Icon , Item , Input} from 'native-base';
import { CheckBox } from 'react-native-elements';
import { colors } from '../themes/colors';
import { getURL } from '../services/helper';
import { TooltipBox } from './TooltipBox';
import i18n from 'i18next';
import { connect } from "react-redux";

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

  return (
    <KeyboardAvoidingView>
      <View style={{ alignItems: 'stretch' }}>
        {
          itemOrder.map((item, index) => (
            <ListItem
              style={{ width: '90%' }}
              onPress={() => handlePress(token ? item.name.en : item.value)}
              key={index}
            >
              <View style={{ width: '8%' }}>
                {item.description ? (
                  <TooltipBox text={item.description}>
                    <Icon type="FontAwesome" name="question-circle" style={{color: '#016fbe', fontSize: 24, marginHorizontal: 0}} />
                  </TooltipBox>
                ) : (
                  <View />
                )}
              </View>
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
                      <Text>{item.name.en} {token ? (item.value < 0 ? '(' + item.value + ')' : '(+' + item.value + ')') : ""}</Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        marginLeft: '8%',
                        maxWidth: '92%',
                        justifyContent: 'center',
                      }}
                    >
                      <Text>{item.name.en} {token ? (item.value < 0 ? '(' + item.value + ')' : '(+' + item.value + ')') : ""}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ width: '15%' }}>
                <CheckBox
                  checked={finalAnswer["value"] === (token ? item.name.en : item.value)}
                  onPress={() => handlePress(token ? item.name.en : item.value)}
                  checkedIcon="dot-circle-o"
                  uncheckedIcon="circle-o"
                  checkedColor={colors.primary}
                />
              </View>
            </ListItem>
          ))
        }

        {
          config.isOptionalText ?
              (<View style={{
                  marginTop: '8%' ,
                  width: '100%' ,
                }}
                >
            <Item bordered
            style={{borderWidth: 1}}
            >
              <TextInput
                  style={{
                    width: '100%',
                    ... Platform.OS !== 'ios' ? {} : { maxHeight: 100, minHeight: 40 }
                  }}
                  placeholder = {
                    i18n.t(config.isOptionalTextRequired ? 'optional_text:required' : 'optional_text:enter_text')
                  }
                  onChangeText={text=>handleComment(text)}
                  value={finalAnswer["text"]}
                  multiline={true}
              />
            </Item>
          </View>
          ):<View></View>
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
