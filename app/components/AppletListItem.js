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

const AppletListItem = ({ applet, onPress }) => {
  const numberOverdue = applet.activities.reduce(
    (accumulator, activity) => (activity.isOverdue ? accumulator + 1 : accumulator),
    0,
  );

  return (
    <View style={styles.box}>
      <TouchBox onPress={() => onPress(applet)}>
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
      { numberOverdue > 0 && (
        <View style={styles.notification}>
          <NotificationText>
            {numberOverdue}
          </NotificationText>
        </View>
      )}
    </View>
  );
};

AppletListItem.propTypes = {
  applet: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default AppletListItem;
