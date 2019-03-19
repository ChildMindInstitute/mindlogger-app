import React from 'react';
import { ActivityIndicator } from 'react-native';
import {
  Button,
  Text,
  Form,
} from 'native-base';
import { reduxForm, Field, propTypes } from 'redux-form';
import { colors } from '../../theme';
import { FormInputItem } from '../../components/form/FormItem';
import styles from './styles';

const validate = (body) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  const errors = {};
  if (!body.login || body.login.length === 0) {
    errors.login = 'Please enter a username';
  }
  if (!body.firstName || body.firstName.length === 0) {
    errors.firstName = 'Please enter a first name';
  }
  if (!body.lastName || body.lastName.length === 0) {
    errors.lastName = 'Please enter a last name';
  }
  if (!body.email || body.email.length === 0) {
    errors.email = 'Please enter an email address';
  } else if (!emailRegex.test(body.email)) {
    errors.email = 'Please enter an email address';
  }
  if (!body.password || body.password.length === 0) {
    errors.password = 'Please enter a password';
  }
  return errors;
};

const SignUpForm = ({ handleSubmit, submitting, error }) => (
  <Form>
    <Field
      component={FormInputItem}
      placeholder="Username"
      name="login"
      style={styles.text}
      placeholderTextColor="#aaa"
      autoComplete="off"
      autoCorrect={false}
      autoCapitalize="none"
    />
    <Field
      component={FormInputItem}
      placeholder="First name"
      name="firstName"
      style={styles.text}
      placeholderTextColor="#aaa"
      autoComplete="off"
      autoCorrect={false}
    />
    <Field
      component={FormInputItem}
      placeholder="Last name"
      name="lastName"
      style={styles.text}
      placeholderTextColor="#aaa"
      autoComplete="off"
      autoCorrect={false}
    />
    <Field
      component={FormInputItem}
      placeholder="Email"
      name="email"
      style={styles.text}
      placeholderTextColor="#aaa"
      autoComplete="off"
      autoCorrect={false}
      autoCapitalize="none"
      keyboardType="email-address"
    />
    <Field
      component={FormInputItem}
      placeholder="Password"
      name="password"
      style={styles.text}
      placeholderTextColor="#aaa"
      secureTextEntry
      autoComplete="off"
      autoCorrect={false}
      autoCapitalize="none"
    />
    <Button
      warning
      style={{ marginTop: 40 }}
      block
      onPress={handleSubmit}
      disabled={submitting}
    >
      {submitting
        ? <ActivityIndicator color={colors.primary} />
        : <Text style={styles.buttonText}>Sign Up</Text>}
    </Button>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </Form>
);

SignUpForm.propTypes = {
  ...propTypes,
};

const SignUpFormConnected = reduxForm({
  form: 'signup-form',
  validate,
  enableReinitialize: true,
})(SignUpForm);

export default SignUpFormConnected;
