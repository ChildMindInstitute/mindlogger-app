import React, { useState } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import { Button, Text, Form, View } from 'native-base';
import { reduxForm, Field, propTypes } from 'redux-form';
import { CheckBox } from 'react-native-elements';
import i18n from 'i18next';

import { FormInputItem, required } from '../../components/form/FormItem';
import styles from './styles';
import { colors } from '../../theme';

const login = value => (value && !RegExp('^[a-z][\\da-z\\-\\.]{3,}$').test(value)
  ? i18n.t('sign_up_form:username_validation_error')
  : undefined);

const email = value => (value && !RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$').test(value)
  ? i18n.t('sign_up_form:email_validation_error')
  : undefined);

const password = value => (value && !RegExp('.{6}.*').test(value) ? 'Password must be at least 6 characters' : undefined);

const SignUpForm = ({ handleSubmit, submitting, primaryColor }) => {
  const [terms, setTerms] = useState(false);

  return (
    <Form>
      <Field
        component={FormInputItem}
        placeholder={i18n.t('sign_up_form:email_placeholder')}
        name="email"
        style={styles.text}
        placeholderTextColor={colors.secondary_50}
        autoComplete="off"
        autoCorrect={false}
        validate={[required, email]}
      />
      <Field
        component={FormInputItem}
        placeholder={i18n.t('sign_up_form:display_name_placeholder')}
        name="displayName"
        style={styles.text}
        placeholderTextColor={colors.secondary_50}
        autoComplete="off"
        autoCorrect={false}
        validate={required}
      />
      <Field
        component={FormInputItem}
        placeholder={i18n.t('sign_up_form:password_placeholder')}
        name="password"
        style={styles.text}
        placeholderTextColor={colors.secondary_50}
        secureTextEntry
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        validate={[required, password]}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <CheckBox
          checked={terms}
          onPress={() => setTerms(!terms)}
          checkedIcon="check-square"
          uncheckedIcon="square-o"
          checkedColor={'white'}
          uncheckedColor={'white'}
        />
        <Text style={{ color: 'white' }} onPress={() => setTerms(!terms)}>
          I agree to the <Text style={{ color: 'white', textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://mindlogger.org/terms')} >Terms of Service</Text>
        </Text>
      </View>

      <Button warning style={styles.button} block onPress={handleSubmit} disabled={submitting || !terms}>
        {submitting ? (
          <ActivityIndicator color={primaryColor} />
        ) : (
          <Text style={[styles.buttonText, { color: primaryColor }]}>
            {i18n.t('sign_up_form:sign_up')}
          </Text>
        )}
      </Button>
    </Form>
  )
};

SignUpForm.propTypes = {
  ...propTypes,
};

const SignUpFormConnected = reduxForm({
  form: 'signup-form',
  enableReinitialize: true,
})(SignUpForm);

export default SignUpFormConnected;
