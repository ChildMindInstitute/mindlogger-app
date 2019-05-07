import React from 'react';
import {StyleSheet} from 'react-native';
import { View, Item, Input, Label, Text, Switch, Radio, Body, Right, Picker, CheckBox, Button, Row, ListItem } from 'native-base';
import InputNumber from 'rc-input-number';
import DatePicker from 'react-native-datepicker';
import { colors } from '../../theme';

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
  errorText: {
    color: colors.tertiary,
    fontSize: 12,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 8,
    marginBottom: 8,
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
});

export const FormInputItem = ({
  input: { ...input },
  errorStyle = {},
  label,
  stackedLabel,
  floatingLabel,
  itemStyle,
  name,
  meta: { touched, error, warning },
  ...props
}) => (
  <View>
    <Item
      stackedLabel={stackedLabel}
      floatingLabel={floatingLabel}
      style={itemStyle}
      error={touched && typeof error !== 'undefined'}
      last
    >
      <Label style={props.style}>{label}</Label>
      <Input {...props} onChangeText={input.onChange} {...input} />
    </Item>
    {touched && error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    {touched && warning && <Text style={[styles.errorText, errorStyle]}>{warning}</Text>}
  </View>
);

export const FormSwitchItem = ({ input, label, name, meta: { touched, error, warning }, ...inputProps}) => {
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
    <Radio selected={option.value === input.value} onPress={()=> input.onChange(option.value)}/>
    </Right>
    </Item>
      ))}</View>)
}

export const FormPickerGroup = ({ input, name, options, stackedLabel,meta: { touched, error, warning }, ...inputProps }) => {
  var hasError= false;
  if(error !== undefined){
    hasError= true;
  }
  return (<View><Picker mode ="dropdown" iosHeader="Select one" {...inputProps} selectedValue={input.value} onValueChange={input.onChange} error= {hasError}>{options.map((option, idx)=>(
    <Item key={idx} style={{color:'red'}} label={option.text} value={option.value}/>
      ))}</Picker></View>)
}

export const FormRadioButtonGroup = ({ type,input, name, options, stackedLabel }) => {
  var hasError= false;
  return (<Item style={{justifyContent: 'space-between'}} >{options.map((option, idx)=>(
    <Button key={idx} style={{margin:4}} onPress={()=> input.onChange(option.value)} light={input.value !== option.value} success={input.value == option.value}>
    <Text style={{textAlign: "center", fontSize: 12 }}>{option.text}</Text>
    </Button>
      ))}</Item>)
}

export const FormInputNumberItem = ({ input, label, stackedLabel, floatingLabel,style, name, meta: { touched, error, warning }, ...inputProps}) => {
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

export const FormInputCheckItem = ({ input, label, style, name, itemStyle, meta: {touched, error, warning}, ...props}) => {
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

export const FormInputDatePicker = ({input, style, ...props}) => {
  return (
    <DatePicker style={style} date={input.value} mode="datetime"
    confirmBtnText="Confirm"
    cancelBtnText="Cancel"
    minuteInterval={10}
    {...props}
    onDateChange={time => input.onChange(time)} />
  )
}

export const required = value => value ? undefined : 'Required'
export const maxLength = max => value =>
  value && value.length > max ? `Must be ${max} characters or less` : undefined
export const maxLength15 = maxLength(15)
export const isNumber = value => value && isNaN(Number(value)) ? 'Must be a number' : undefined
