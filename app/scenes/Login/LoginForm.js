import React from 'react';
import { ActivityIndicator } from 'react-native';
import {
  Button,
  Text,
  Form,
} from 'native-base';
import { reduxForm, Field, propTypes } from 'redux-form';
import { colors } from '../../themes/skinColors';
import { FormInputItem, required } from '../../components/form/FormItem';
import styles from './styles';

const LoginForm = ({ handleSubmit, submitting, error }) => (
  <Form>
    <Field
      component={FormInputItem}
      placeholder="Username"
      placeholderTextColor={colors().secondary_50}
      name="user"
      autoCapitalize="none"
      style={styles.text}
      validate={required}
      errorStyle={{ color: colors().secondary }}
    />
    <Field
      component={FormInputItem}
      placeholder="Password"
      placeholderTextColor={colors().secondary_50}
      name="password"
      autoCapitalize="none"
      style={styles.text}
      secureTextEntry
      validate={required}
      errorStyle={{ color: colors().secondary }}
    />
    <Button style={styles.button} block onPress={handleSubmit} disabled={submitting}>
      {submitting
        ? <ActivityIndicator color={colors().primary} />
        : <Text style={[styles.buttonText, { color: colors().primary }]}>LOGIN</Text>}
    </Button>
  </Form>
);

LoginForm.propTypes = {
  ...propTypes,
};

const LoginFormConnected = reduxForm({
  form: 'login-form',
  enableReinitialize: true,
})(LoginForm);

export default LoginFormConnected;
