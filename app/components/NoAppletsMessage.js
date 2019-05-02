import React from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { colors } from '../theme';
import { BodyText } from './core';

const styles = StyleSheet.create({
  noAppletsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAppletsMessage: {
    textAlign: 'center',
    color: colors.grey,
    margin: 50,
  },
});

const NoAppletsMessage = ({ isDownloadingApplets }) => (
  <View style={styles.noAppletsContainer}>
    {isDownloadingApplets
      ? (
        <BodyText style={styles.noAppletsMessage}>
          Checking for studies...
        </BodyText>
      )
      : (
        <BodyText style={styles.noAppletsMessage}>
          You aren't enrolled in any studies.
        </BodyText>
      )
    }
  </View>
);

NoAppletsMessage.propTypes = {
  isDownloadingApplets: PropTypes.bool.isRequired,
};

export default NoAppletsMessage;
