import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import {
  TouchBox,
  SubHeading,
  BodyText,
  NotificationText,
} from './core';
import AppletImage from './AppletImage';

const styles = StyleSheet.create({
  box: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    position: 'relative',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
  },
  notification: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

const AppletListItem = ({ applet }) => (
  <View style={styles.box}>
    <TouchBox>
      <View style={styles.inner}>
        <AppletImage applet={applet} />
        <View style={styles.textBlock}>
          <SubHeading>
            {applet.name.en}
          </SubHeading>
          <BodyText>
            {applet.description.en}
          </BodyText>
        </View>
      </View>
    </TouchBox>
    <View style={styles.notification}>
      <NotificationText>
        1
      </NotificationText>
    </View>
  </View>
);

AppletListItem.propTypes = {
  applet: PropTypes.object.isRequired,
};

export default AppletListItem;
