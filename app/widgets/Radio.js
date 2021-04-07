import React from 'react';
import PropTypes from 'prop-types';
import { View, Image ,KeyboardAvoidingView,ScrollView, TextInput, Platform} from 'react-native';
import { ListItem, Text, Icon , Item , Input} from 'native-base';
import { CheckBox } from 'react-native-elements';
import { colors } from '../themes/colors';
import { getURL } from '../services/helper';
import { TooltipBox } from './TooltipBox';

export const Radio = ({ value, config, onChange, token ,selected, onSelected }) => {

  let finalAnswer = value ? value : {};

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
    <KeyboardAvoidingView
   // behavior="padding"
  >
    <View style={{ alignItems: 'stretch' }}>
      {config.itemList.map((item, index) => (
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
      ))}

      {config.isOptionalText ?
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
              ... Platform.OS !== 'ios' ? {} : { maxHeight: 100 }
            }}
            placeholder = "Please enter the text"
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
  token: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};
