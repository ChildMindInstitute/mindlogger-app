import React from 'react';
import { ActivityIndicator } from 'react-native';
import {
  Button,
  Text,
  Form,
} from 'native-base';
import { reduxForm, Field, propTypes } from 'redux-form';
import { FormInputItem, required } from '../../components/form/FormItem';
import styles from './styles';
import { colors } from '../../theme';

const login = value => (value && !RegExp('^[a-z][\\da-z\\-\\.]{3,}$').test(value)
  ? 'Username must be at least 4 characters, start with a letter, and may only contain letters, numbers, dashes, and dots.' : undefined);

const email = value => (value && !RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$').test(value)
  ? 'Looks like this email is incomplete' : undefined);

const password = value => (value && !RegExp('.{6}.*').test(value)
  ? 'Password must be at least 6 characters' : undefined);


const SignUpForm = ({ handleSubmit, submitting, primaryColor }) => (
  <Form>
    <Field
      component={FormInputItem}
      placeholder="Username"
      name="login"
      style={styles.text}
      placeholderTextColor={colors.secondary_50}
      autoComplete="off"
      autoCorrect={false}
      autoCapitalize="none"
      validate={[required, login]}
    />
    <Field
      component={FormInputItem}
      placeholder="Display name"
      name="displayName"
      style={styles.text}
      placeholderTextColor={colors.secondary_50}
      autoComplete="off"
      autoCorrect={false}
      validate={required}
    />
    <Field
      component={FormInputItem}
      placeholder="Email"
      name="email"
      style={styles.text}
      placeholderTextColor={colors.secondary_50}
      autoComplete="off"
      autoCorrect={false}
      validate={[required, email]}
    />
    <Field
      component={FormInputItem}
      placeholder="Password"
      name="password"
      style={styles.text}
      placeholderTextColor={colors.secondary_50}
      secureTextEntry
      autoComplete="off"
      autoCorrect={false}
      autoCapitalize="none"
      validate={[required, password]}
    />
    <Button
      warning
      style={styles.button}
      block
      onPress={handleSubmit}
      disabled={submitting}
    >
      {submitting
        ? <ActivityIndicator color={primaryColor} />
        : <Text style={[styles.buttonText, { color: primaryColor }]}>Sign Up</Text>}
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
