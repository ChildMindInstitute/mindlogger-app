import React from 'react';
import { ActivityIndicator } from 'react-native';
import {
  Button,
  Text,
  Form,
} from 'native-base';
import { reduxForm, Field, propTypes } from 'redux-form';
import { colors } from '../../theme';
import { FormInputItem, required } from '../../components/form/FormItem';
import styles from './styles';

const login = value =>
  value && !RegExp('^[a-z][\\da-z\\-\\.]{3,}$').test(value) ?
  'Username must be at least 4 characters, start with a letter, and may only contain letters, numbers, dashes, and dots.' : undefined

const email = value =>
  value && !RegExp('^[\\w\\.\\-\\+]*@[\\w\\.\\-]*\\.\\w+$').test(value) ?
  'Invalid email address' : undefined

const password = value =>
  value && !RegExp('.{6}.*').test(value) ?
  'Password must be at least 6 characters' : undefined


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
      validate = {[required, login]}
    />
    <Field
      component={FormInputItem}
      placeholder="First name"
      name="firstName"
      style={styles.text}
      placeholderTextColor="#aaa"
      autoComplete="off"
      autoCorrect={false}
      validate = {required}
    />
    <Field
      component={FormInputItem}
      placeholder="Last name"
      name="lastName"
      style={styles.text}
      placeholderTextColor="#aaa"
      autoComplete="off"
      autoCorrect={false}
      validate = {required}
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
      validate = {[required, email]}
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
      validate = {[required, password]}
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
