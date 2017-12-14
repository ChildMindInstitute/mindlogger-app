import React from 'react';
import {StyleSheet} from 'react-native';
import { View, Item, Input, Label, Text, Switch, Radio, Body, Right, Picker, CheckBox, Button, Row, ListItem } from 'native-base';
import InputNumber from 'rc-input-number';
import AudioRecord from '../audio/AudioRecord';

export const FormInputItem = ({ input: {...input}, label, stackedLabel, floatingLabel, itemStyle, name, ...props , meta: { touched, error, warning } }) => {
    var hasError= false;
    if(error !== undefined){
      hasError= true;
    }
    return( <Item stackedLabel={stackedLabel} floatingLabel={floatingLabel} style={itemStyle} error= {hasError} last>
                <Label style={props.style}>{label}</Label>
                <Input {...props} onChangeText={input.onChange} {...input}/>
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

export const FormPickerGroup = ({ input, name, ...inputProps, options, stackedLabel,meta: { touched, error, warning } }) => {
  var hasError= false;
  if(error !== undefined){
    hasError= true;
  }
  return (<View><Picker mode ="dropdown" iosHeader="Select one" {...inputProps} selectedValue={input.value} onValueChange={input.onChange}>{options.map((option, idx)=>(
    <Item key={idx} style={{color:'red'}} label={option.text} value={option.value}/>
      ))}</Picker>{hasError && <Item error={hasError}><Body></Body><Right><Text>{error}</Text></Right></Item>}</View>)
}

export const FormRadioButtonGroup = ({ type,input, name, options, stackedLabel }) => {
  var hasError= false;
  return (<Item style={{justifyContent: 'space-between'}} >{options.map((option, idx)=>(
    <Button key={idx} style={{margin:4}} onPress={()=> input.onChange(option.value)} light={input.value !== option.value} success={input.value == option.value}>
    <Text style={{textAlign: "center", fontSize: 12 }}>{option.text}</Text>
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

export const FormInputAudio = ({ input, stackedLabel, label, style, name, ...inputProps , meta: { touched, error, warning } }) => {
  var hasError= false;
  if(error !== undefined){
    hasError= true;
  }
  return( <View stackedLabel={stackedLabel} style={style} error= {hasError}>
              <Text>{label}</Text>
              <AudioRecord onRecordFile={(filePath)=>input.onChange(filePath)} path={input.value}/>
              {hasError ? <Text>{error}</Text> : <Text />}
          </View> )
}

export const FormInputCheckItem = ({ input, label, style, name, itemStyle, ...props, meta: {touched, error, warning} }) => {
  var hasError =false;
  if(error !== undefined) {
    hasError = true;
  }
  return(
    <ListItem style={itemStyle} noBorder {...props}>
      <CheckBox {...input} onPress={() => input.onChange(input.value == false)} checked={input.value == true} />
      <Body><Text style={style}>{label}</Text></Body>
    </ListItem>
  )
}

export const required = value => value ? undefined : 'Required'
export const maxLength = max => value =>
  value && value.length > max ? `Must be ${max} characters or less` : undefined
export const maxLength15 = maxLength(15)
export const isNumber = value => value && isNaN(Number(value)) ? 'Must be a number' : undefined