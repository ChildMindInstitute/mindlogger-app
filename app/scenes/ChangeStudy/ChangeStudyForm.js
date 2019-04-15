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

const ChangeStudyForm = ({ onReset, error, handleSubmit, submitting, initialValues }) => (
  <Form>
    <Field
      component={FormInputItem}
      placeholder={initialValues.apiHost}
      placeholderTextColor={colors.secondary_50}
      name="apiHost"
      autoCapitalize="none"
      style={styles.text}
      keyboardType="email-address"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
    <Button style={styles.button} block onPress={handleSubmit} disabled={submitting}>
      {submitting
        ? <ActivityIndicator color={colors.primary} />
        : <Text style={styles.buttonText}>Change Study</Text>}
    </Button>
    <Button style={styles.button} block onPress={onReset} disabled={submitting}>
      {submitting
        ? <ActivityIndicator color={colors.primary} />
        : <Text style={styles.buttonText}>Reset Study</Text>}
    </Button>
  </Form>
);

ChangeStudyForm.propTypes = {
  ...propTypes,
};

const ChangeStudyFormConnected = reduxForm({
  form: 'change-study-form',
  enableReinitialize: true,
})(ChangeStudyForm);

export default ChangeStudyFormConnected;
