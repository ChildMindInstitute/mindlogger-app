import React from 'react';
import PropTypes from 'prop-types';
import * as R from "ramda";
import { View, Image } from 'react-native';
import { ListItem, Text, Icon,Input,Item  } from 'native-base';
import { CheckBox } from 'react-native-elements';
import { colors } from '../themes/colors';
import { getURL } from '../services/helper';
import { TooltipBox } from './TooltipBox';

export const Radio = ({ value, config, onChange, token ,selected, onSelected }) => {

  ans = value;

  if (value !== undefined ) {
    value = value.val
    text = value.text
  }

  const setAnswer = (key , value) => {
    ans[key] = value;
  }

  
  const handlePress = (itemValue) => {
    // if the radio was selected , record it and save things 
  /*  if (selected) {
    setAnswer ("val" , itemValue) ;
    }

    if (ans["val"] && (ans["text"] && config.isOptionalTextRequired)) {
      onSelected(true); 
      onChange(ans);
    } else if (!config.isOptionalTextRequired && ans["val"]){
      onSelected(true); 
      onChange(ans);
    }*/
  };


  const handleComment = (value) => {
    //if the Comment is provided record it and set the change 
      setAnswer ("text" , value) ;
      onChange(ans);
  }

  return (
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
              checked={value === (token ? item.name.en : item.value)}
              onPress={() => handlePress(token ? item.name.en : item.value)}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checkedColor={colors.primary}
            />
          </View>
        </ListItem>
      ))
    }
    {config.isOptionalText ? 
      (<View    style={{
                    marginTop: '8%' ,
                    justifyContent: 'center',
                  }}
                  >
      <Item bordered>
      <Input 
          onChangeText={text=>handleComment(text)}
          value={text}
      />
      </Item> 
    </View>
    ):<View></View>
      }
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
  token: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};
