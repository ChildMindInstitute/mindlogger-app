import React from 'react';
import { StyleSheet, TextInput, Platform } from 'react-native';
import { View, Item, Input, Label, Text } from 'native-base';
import i18n from 'i18next';
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
      style={{ ...(itemStyle || {}), padding: Platform.OS === 'android' ? 0 : 10 }}
      error={touched && typeof error !== 'undefined'}
      last
    >
      <Label style={props.style}>{label}</Label>
      {
        Platform.OS === 'android'
          ? <Input {...props} onChangeText={input.onChange} {...input} />
          : <TextInput {...props} selectionColor={"white"} onChangeText={input.onChange} {...input} style={{...props.style, width: '100%'}} />
      }
    </Item>
    {touched && error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    {touched && warning && <Text style={[styles.errorText, errorStyle]}>{warning}</Text>}
  </View>
)

export const required = value => (value ? undefined : i18n.t('form_item:required'));
export const maxLength = max => value => (value && value.length > max
  ? `${i18n.t('form_item:must_be')} ${max} ${i18n.t('form_item:characters_or_less')}`
  : undefined);
export const maxLength15 = maxLength(15);
export const isNumber = value => (value && isNaN(Number(value)) ? i18n.t('form_item:must_be_a_number') : undefined);
