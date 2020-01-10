import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Item, Input, Label, Text } from 'native-base';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  errorText: {
    color: colors.tertiary,
    fontSize: 12,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 8,
    marginBottom: 8,
  },
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

export const required = value => (value ? undefined : 'Required');
export const maxLength = max => value => (value && value.length > max ? `Must be ${max} characters or less` : undefined);
export const maxLength15 = maxLength(15);
export const isNumber = value => (value && isNaN(Number(value)) ? 'Must be a number' : undefined);
