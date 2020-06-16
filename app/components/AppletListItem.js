import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import TouchBox from './core/TouchBox';
import {
  SubHeading,
  BodyText,
  NotificationText,
} from './core';
import AppletImage from './AppletImage';
import theme from '../themes/variables';

const styles = StyleSheet.create({
  box: {
    position: 'relative',
    fontFamily: theme.fontFamily,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontFamily: theme.fontFamily,
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
    fontFamily: theme.fontFamily,
  },
  notification: {
    position: 'absolute',
    top: 0,
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
            <SubHeading style={{ fontFamily: theme.fontFamily }}>
              {applet.name.en}
            </SubHeading>
            {applet.description && (
              <BodyText style={{ fontFamily: theme.fontFamily }}>
                {applet.description.en}
              </BodyText>
            )}
          </View>
        </View>
      </TouchBox>
      {numberOverdue > 0 && (
        <View style={styles.notification}>
          <NotificationText>{numberOverdue}</NotificationText>
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
