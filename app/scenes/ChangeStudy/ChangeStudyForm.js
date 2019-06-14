import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  Button,
  Text,
  Form,
} from 'native-base';
import { reduxForm, Field, propTypes } from 'redux-form';
import styles from './styles';
import { FormInputItem } from '../../components/form/FormItem';
import { colors } from '../../theme';

const ChangeStudyForm = ({
  onReset,
  error,
  handleSubmit,
  submitting,
  initialValues,
  primaryColor,
}) => (
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
    <View style={styles.buttonContainer}>
      <Button style={styles.button} block onPress={onReset} disabled={submitting}>
        {submitting
          ? <ActivityIndicator color={primaryColor} />
          : <Text style={[styles.buttonText, { color: primaryColor }]}>Reset</Text>}
      </Button>
      <Button style={styles.button} block onPress={handleSubmit} disabled={submitting}>
        {submitting
          ? <ActivityIndicator color={primaryColor} />
          : <Text style={[styles.buttonText, { color: primaryColor }]}>Submit</Text>}
      </Button>
    </View>
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
