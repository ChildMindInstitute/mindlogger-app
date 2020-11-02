import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button, Text, Form } from 'native-base';
import i18n from 'i18next';
import { reduxForm, Field, propTypes } from 'redux-form';

import styles from './styles';
import { FormInputItem } from '../../components/form/FormItem';
import { colors } from '../../theme';

const validateEmail = (value) => {
  if (!value || value.length === 0) {
    return i18n.t('forgot_pass_form:enter_email_mess');
  }
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  if (!regex.test(value)) {
    return i18n.t('forgot_pass_form:invalid_email');
  }
  return undefined;
};

const ForgotPasswordForm = ({ error, handleSubmit, submitting, primaryColor }) => (
  <Form>
    <Field
      component={FormInputItem}
      placeholder={i18n.t('forgot_pass_form:email_address')}
      placeholderTextColor={colors.secondary_50}
      name="email"
      autoCapitalize="none"
      style={styles.text}
      validate={validateEmail}
      keyboardType="email-address"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
    <Button style={styles.button} block onPress={handleSubmit} disabled={submitting}>
      {submitting ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text style={[styles.buttonText, { color: primaryColor }]}>
          {i18n.t('forgot_pass_form:reset_pass')}
        </Text>
      )}
    </Button>
  </Form>
);

ForgotPasswordForm.propTypes = {
  ...propTypes,
};

const ForgotPasswordFormConnected = reduxForm({
  form: 'forgot-password-form',
  enableReinitialize: true,
})(ForgotPasswordForm);

export default ForgotPasswordFormConnected;
