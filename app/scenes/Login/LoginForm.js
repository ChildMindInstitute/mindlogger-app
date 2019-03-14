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
  const errors = {};
  if (!body.user || body.user.length === 0) {
    errors.user = 'Please enter a username';
  }
  if (!body.password || body.password.length === 0) {
    errors.password = 'Please enter a password';
  }
  return errors;
};

const LoginForm = ({ handleSubmit, submitting, error }) => (
  <Form>
    <Field
      component={FormInputItem}
      placeholder="Username"
      placeholderTextColor={colors.secondary_50}
      name="user"
      autoCapitalize="none"
      style={styles.text}
    />
    <Field
      component={FormInputItem}
      placeholder="Password"
      placeholderTextColor={colors.secondary_50}
      name="password"
      autoCapitalize="none"
      style={styles.text}
      secureTextEntry
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
    <Button style={styles.button} block onPress={handleSubmit} disabled={submitting}>
      {submitting
        ? <ActivityIndicator color={colors.primary} />
        : <Text style={styles.buttonText}>LOGIN</Text>}
    </Button>
  </Form>
);

LoginForm.propTypes = {
  ...propTypes,
};

const LoginFormConnected = reduxForm({
  form: 'login-form',
  validate,
  enableReinitialize: true,
})(LoginForm);

export default LoginFormConnected;
