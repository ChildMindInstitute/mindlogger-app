import React from 'react';
import { ActivityIndicator } from 'react-native';
import { propTypes } from 'react-redux';
import { Button, Form, Text } from 'native-base';
import { reduxForm, Field } from 'redux-form';
import { FormInputItem } from '../../components/form/FormItem';
import styles from './styles';
import { colors } from '../../theme';

const validate = ({ firstName, lastName, oldPassword, password }) => {
  const errors = {};

  if (!firstName || firstName.length === 0) {
    errors.firstName = 'Please enter a first name';
  }
  if (!lastName || lastName.length === 0) {
    errors.lastName = 'Please enter a last name';
  }
  if (password && (!oldPassword || oldPassword.length === 0)) {
    errors.oldPassword = 'Please enter your old password';
  }
  if (oldPassword && (!password || password.length === 0)) {
    errors.password = 'Please enter a new password';
  }

  return errors;
};

const UserForm = ({ handleSubmit, submitting, error }) => (
  <Form>
    <Field
      component={FormInputItem}
      name="firstName"
      placeholder="First Name"
      style={styles.text}
      autoComplete="off"
      autoCorrect={false}
    />
    <Field
      component={FormInputItem}
      name="lastName"
      placeholder="Last Name"
      style={styles.text}
      autoComplete="off"
      autoCorrect={false}
    />
    <Field
      component={FormInputItem}
      placeholder="Current password"
      name="oldPassword"
      style={styles.text}
      secureTextEntry
      autoComplete="off"
      autoCorrect={false}
      autoCapitalize="none"
    />
    <Field
      component={FormInputItem}
      placeholder="New password"
      name="password"
      style={styles.text}
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
        : <Text style={styles.buttonText}>Update</Text>}
    </Button>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </Form>
);

UserForm.propTypes = {
  ...propTypes,
};

const UserFormConnected = reduxForm({
  form: 'user-form',
  validate,
  enableReinitialize: true,
})(UserForm);

export default UserFormConnected;
