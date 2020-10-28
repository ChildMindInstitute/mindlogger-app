import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { H3, Text, Button } from 'native-base';
import { colors } from '../../theme';
import i18n from '../../i18n/i18n';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: 3,
    width: '90%',
    backgroundColor: colors.secondary,
    padding: 30,
  },
  header: {
    width: '100%',
    textAlign: 'center',
    marginBottom: 16,
  },
  bodyCopy: {
    marginBottom: 16,
  },
  buttonArea: {
    flexDirection: 'row',
  },
  button: {
    justifyContent: 'center',
    flex: 1,
    fontSize: 14,
    margin: 2,
  },
});

const LogoutWarning = ({ onCancel, onLogout }) => (
  <View style={styles.container}>
    <View style={styles.modal}>
      <H3 style={styles.header}>{i18n.t('logout_warning:uploads_in_progress')}</H3>
      <Text style={styles.bodyCopy}>{i18n.t('logout_warning:currently_uploading')}</Text>
      <Text style={styles.bodyCopy}>{i18n.t('logout_warning:sure_logout')}</Text>
      <View style={styles.buttonArea}>
        <Button bordered style={styles.button} onPress={onCancel}>
          <Text>{i18n.t('logout_warning:cancel')}</Text>
        </Button>
        <Button style={styles.button} onPress={onLogout}>
          <Text>{i18n.t('logout_warning:logout')}</Text>
        </Button>
      </View>
    </View>
  </View>
);

LogoutWarning.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default LogoutWarning;
