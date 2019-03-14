import React from 'react';
import { ActivityIndicator } from 'react-native';
import {
  Button,
  Text,
  Form,
} from 'native-base';
import { reduxForm, Field, propTypes } from 'redux-form';
import styles from './styles';
import { FormInputItem } from '../../components/form/FormItem';
import { colors } from '../../theme';

const validateEmail = (value) => {
  if (!value || value.length === 0) {
    return 'Please enter your email address';
  }
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  if (!regex.test(value)) {
    return 'Invalid email address';
  }
  return undefined;
};

const ForgotPasswordForm = ({ error, handleSubmit, submitting }) => (
  <Form>
    <Field
      component={FormInputItem}
      placeholder="Email address"
      placeholderTextColor={colors.secondary_50}
      name="email"
      autoCapitalize="none"
      style={styles.text}
      validate={validateEmail}
      keyboardType="email-address"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
    <Button style={styles.button} block onPress={handleSubmit} disabled={submitting}>
      {submitting
        ? <ActivityIndicator color={colors.primary} />
        : <Text style={styles.buttonText}>Reset Password</Text>}
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
