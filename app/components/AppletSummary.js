import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import {
  BodyText,
} from './core';
import AppletImage from './AppletImage';

const styles = StyleSheet.create({
  box: {
    padding: 20,
    paddingTop: 40,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
  },
});

const AppletSummary = ({ applet }) => (
  <View style={styles.box}>
    <View style={styles.inner}>
      <AppletImage applet={applet} />
      <View style={styles.textBlock}>
        <BodyText>
          {applet.description.en}
        </BodyText>
      </View>
    </View>
  </View>
);

AppletSummary.propTypes = {
  applet: PropTypes.object.isRequired,
};

export default AppletSummary;
