import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { colors } from '../theme';
import { BodyText, Hyperlink } from './core';
import { joinExampleApplet } from '../state/applets/applets.thunks';

const styles = StyleSheet.create({
  noAppletsContainer: {
    padding: 50,
  },
  noAppletsMessage: {
    textAlign: 'center',
    color: colors.grey,
    fontSize: 18,
  },
  link: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 18,
  },
});

const NoAppletsMessage = ({ isDownloadingApplets, joinExampleApplet }) => (
  <View style={styles.noAppletsContainer}>
    {isDownloadingApplets
      ? (
        <BodyText style={styles.noAppletsMessage}>
          Sycning...
        </BodyText>
      )
      : (
        <View>
          <BodyText style={styles.noAppletsMessage}>
            You aren't enrolled in any studies.
          </BodyText>
          <Hyperlink style={styles.link} onPress={() => joinExampleApplet()}>
            Join example study
          </Hyperlink>
        </View>
      )
    }
  </View>
);

NoAppletsMessage.propTypes = {
  isDownloadingApplets: PropTypes.bool.isRequired,
  joinExampleApplet: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  joinExampleApplet,
};

export default connect(null, mapDispatchToProps)(NoAppletsMessage);
