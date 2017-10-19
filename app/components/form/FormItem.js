import React from 'react';
import { View, Item, Input, Label, Text, Switch, Radio, Body, Right, Picker, Button } from 'native-base';
export const FormInputItem = ({ input, label, stackedLabel, floatingLabel, name, ...inputProps , meta: { touched, error, warning } }) => {
    var hasError= false;
    if(error !== undefined){
      hasError= true;
    }
    return( <Item stackedLabel={stackedLabel} floatingLabel={floatingLabel} error= {hasError}>
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
              <Switch style={{ margin: 20 }} {...inputProps} onValueChange={input.onChange} onBlur={input.onBlur} onFocus={input.onFocus} value={input.value && true}/>
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
    <Button key={idx} style={{flex:1, margin:4}} onPress={()=> input.onChange(option.value)} light={input.value !== option.value}>
    <Body><Text style={{textAlign: "center" }}>{option.text}</Text></Body>
    </Button>
      ))}</Item>)
}

export default {
  FormInputItem,
  FormSwitchItem,
  FormRadioGroup,
  FormPickerGroup,
  FormRadioButtonGroup
}