import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button, Text, Form } from 'native-base';
import { reduxForm, Field, propTypes } from 'redux-form';
import { useNetInfo } from '@react-native-community/netinfo';
import i18n from 'i18next';

import { colors } from '../../theme';
import { FormInputItem, required } from '../../components/form/FormItem';
import { connectionAlert, mobileDataAlert } from '../../services/networkAlerts';
import styles from './styles';

const LoginForm = ({
  handleSubmit,
  submitting,
  primaryColor,
  mobileDataAllowed,
  toggleMobileDataAllowed,
}) => {
  const netInfo = useNetInfo();

  return (
    <Form>
      <Field
        component={FormInputItem}
        placeholder={i18n.t('login_form:email_placeholder')}
        placeholderTextColor={colors.secondary_50}
        name="user"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.text}
        validate={required}
        errorStyle={{ color: colors.secondary }}
        selectionColor={"#CCCCCC"}
      />
      <Field
        component={FormInputItem}
        placeholder={i18n.t('login_form:password')}
        placeholderTextColor={colors.secondary_50}
        name="password"
        autoCapitalize="none"
        style={styles.text}
        secureTextEntry
        validate={required}
        errorStyle={{ color: colors.secondary }}
        selectionColor={"#CCCCCC"}
      />
      <Button
        style={styles.button}
        block
        onPress={(body) => {
          if (!netInfo.isConnected) {
            connectionAlert();
          } else if (netInfo.type === 'cellular' && !mobileDataAllowed) {
            mobileDataAlert(toggleMobileDataAllowed);
          } else {
            handleSubmit(body);
          }
        }}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={primaryColor} />
        ) : (
          <Text style={[styles.buttonText, { color: primaryColor }]}>
            {i18n.t('login_form:login')}
          </Text>
        )}
      </Button>
    </Form>
  );
};

LoginForm.propTypes = {
  ...propTypes,
};

const LoginFormConnected = reduxForm({
  form: 'login-form',
  enableReinitialize: true,
})(LoginForm);

export default LoginFormConnected;
