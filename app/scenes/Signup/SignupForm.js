import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button, Text, Form } from 'native-base';
import { reduxForm, Field, propTypes } from 'redux-form';
import i18n from 'i18next';

import { FormInputItem, required } from '../../components/form/FormItem';
import styles from './styles';
import { colors } from '../../theme';

const login = value => (value && !RegExp('^[a-z][\\da-z\\-\\.]{3,}$').test(value)
  ? i18n.t('sign_up_form:username_validation_error')
  : undefined);

const email = value => (value && !RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$').test(value)
  ? i18n.t('sign_up_form:email_validation_error')
  : undefined);

const shortPassword = value => (value && !RegExp('.{6}.*').test(value) ? 'Password must be at least 6 characters' : undefined);
const blankPassword = value => (value && value.includes(" ") ? 'Password should not contain blank spaces' : undefined);

const SignUpForm = ({ handleSubmit, submitting, primaryColor }) => (
  <Form>
    <Field
      component={FormInputItem}
      placeholder={i18n.t('sign_up_form:email_placeholder')}
      name="email"
      style={styles.text}
      placeholderTextColor={colors.secondary_50}
      autoComplete="off"
      autoCorrect={false}
      validate={[required, email]}
    />
    <Field
      component={FormInputItem}
      placeholder={i18n.t('sign_up_form:display_name_placeholder')}
      name="displayName"
      style={styles.text}
      placeholderTextColor={colors.secondary_50}
      autoComplete="off"
      autoCorrect={false}
      validate={required}
    />
    <Field
      component={FormInputItem}
      placeholder={i18n.t('sign_up_form:password_placeholder')}
      name="password"
      style={styles.text}
      placeholderTextColor={colors.secondary_50}
      secureTextEntry
      autoComplete="off"
      autoCorrect={false}
      autoCapitalize="none"
      validate={[required, shortPassword, blankPassword]}
    />
    <Button warning style={styles.button} block onPress={handleSubmit} disabled={submitting}>
      {submitting ? (
        <ActivityIndicator color={primaryColor} />
      ) : (
        <Text style={[styles.buttonText, { color: primaryColor }]}>
          {i18n.t('sign_up_form:sign_up')}
        </Text>
      )}
    </Button>
  </Form>
);

SignUpForm.propTypes = {
  ...propTypes,
};

const SignUpFormConnected = reduxForm({
  form: 'signup-form',
  enableReinitialize: true,
})(SignUpForm);

export default SignUpFormConnected;
