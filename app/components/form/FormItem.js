import React from 'react';
import {StyleSheet} from 'react-native';
import { View, Item, Input, Label, Text, Switch, Radio, Body, Right, Picker, Button } from 'native-base';
import InputNumber from 'rc-input-number';
export const FormInputItem = ({ input, label, stackedLabel, floatingLabel,style, name, ...inputProps , meta: { touched, error, warning } }) => {
    var hasError= false;
    if(error !== undefined){
      hasError= true;
    }
    return( <Item stackedLabel={stackedLabel} floatingLabel={floatingLabel} style={style} error= {hasError}>
                <Label>{label}</Label>
                <Input {...inputProps} onChangeText={input.onChange} onBlur={input.onBlur} onFocus={input.onFocus} value={input.value}/>
                {hasError ? <Text>{error}</Text> : <Text />}
            </Item> )
}
export const FormSwitchItem = ({ input, label, name, ...inputProps , meta: { touched, error, warning } }) => {
  var hasError= false;
  if(error !== undefined){
    hasError= true;
  }
  return( <Item style={{ height: 40}} error= {hasError}>
              <Label>{label}</Label>
              <Right>
              <Switch style={{ margin: 20 }} {...inputProps} onValueChange={input.onChange} onBlur={input.onBlur} onFocus={input.onFocus} value={input.value ? true : false}/>
              </Right>
              {hasError ? <Text>{error}</Text> : <Text />}
              
          </Item> )
}

export const FormRadioGroup = ({ type,input, name, options, stackedLabel }) => {
  var hasError= false;
  return (<View>{options.map((option, idx)=>(
    <Item key={idx}>
    <Body>
    <Text onPress={()=> input.onChange(option.value)}>{option.text}</Text>
    </Body>
    <Right>
    <Radio selected={option.value === input.value}/>
    </Right>
    </Item>
      ))}</View>)
}

export const FormPickerGroup = ({ input, name, ...inputProps, options, stackedLabel }) => {
  var hasError= false;
  return (<Picker mode ="dropdown" iosHeader="Select one" {...inputProps} selectedValue={input.value} onValueChange={input.onChange}>{options.map((option, idx)=>(
    <Item key={idx} label={option.text} value={option.value}/>
      ))}</Picker>)
}

export const FormRadioButtonGroup = ({ type,input, name, options, stackedLabel }) => {
  var hasError= false;
  return (<Item >{options.map((option, idx)=>(
    <Button key={idx} style={{flex:1, margin:4}} onPress={()=> input.onChange(option.value)} light={input.value !== option.value} success={input.value === option.value}>
    <Body><Text style={{textAlign: "center" }}>{option.text}</Text></Body>
    </Button>
      ))}</Item>)
}
const styles = StyleSheet.create(
  {
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#222'
  },
  stepWrap: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    backgroundColor: 'white'
  },
  stepText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#999',
    backgroundColor: 'transparent'
  },
  stepDisabled: {
    borderColor: '#d9d9d9',
    backgroundColor: 'rgba(239, 239, 239, 0.72)'
  },
  disabledStepTextColor: {
    color: '#ccc'
  },
  highlightStepTextColor: {
    color: '#2DB7F5'
  },
  highlightStepBorderColor: {
    borderColor: '#2DB7F5'
  }
})
export const FormInputNumberItem = ({ input, label, stackedLabel, floatingLabel,style, name, ...inputProps , meta: { touched, error, warning } }) => {
  var hasError= false;
  if(error !== undefined){
    hasError= true;
  }
  return( <Item stackedLabel={stackedLabel} floatingLabel={floatingLabel} style={style} error= {hasError}>
              <Label>{label}</Label>
              <InputNumber {...inputProps} styles={styles} keyboardType={'number-pad'} onChange={input.onChange} onBlur={input.onBlur} onFocus={input.onFocus} value={input.value || inputProps.min}/>
              {hasError ? <Text>{error}</Text> : <Text />}
          </Item> )
}

export default {
  FormInputItem,
  FormInputNumberItem,
  FormSwitchItem,
  FormRadioGroup,
  FormPickerGroup,
  FormRadioButtonGroup
}