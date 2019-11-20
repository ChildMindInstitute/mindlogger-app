import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Icon } from 'native-base';
import {
  BodyText,
  SubHeading,
} from './core';
import { colors } from '../themes/colors';
import theme from '../themes/base-theme';
import { formatTime } from '../services/time';

const styles = StyleSheet.create({
  box: {
    padding: 20,
    paddingTop: 40,
    fontFamily: theme.fontFamily,
  },
  description: {
    marginBottom: 30,
    fontFamily: theme.fontFamily,
  },
  lockup: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 20,
    fontFamily: theme.fontFamily,
  },
  icon: {
    fontSize: 30,
    color: colors.tertiary,
    marginRight: 16,
  },
});

const lastCompletedString = (timestamp) => {
  if (!timestamp) {
    return 'Not yet completed';
  }
  return `Last completed ${formatTime(timestamp)}`;
};

const nextScheduledString = (activity) => {
  if (!activity.nextScheduledTimestamp) {
    return 'Unscheduled';
  }
  if (activity.isOverdue) {
    return `Due on ${formatTime(activity.lastScheduledTimestamp)}`;
  }
  return `Scheduled for ${formatTime(activity.nextScheduledTimestamp)}`;
};

const ActivitySummary = ({ activity, onPressStart, primaryColor }) => (
  <View style={styles.box}>
    <SubHeading>{activity.name.en}</SubHeading>
    <BodyText style={styles.description}>
      {activity.description.en}
    </BodyText>
    <View style={styles.lockup}>
      <Icon type="FontAwesome" name="calendar" style={styles.icon} />
      <BodyText>{nextScheduledString(activity)}</BodyText>
    </View>
    <View style={styles.lockup}>
      <Icon type="FontAwesome" name="history" style={styles.icon} />
      <BodyText>{lastCompletedString(activity.lastResponseTimestamp)}</BodyText>
    </View>
    <Button onPress={onPressStart} full rounded style={{ backgroundColor: primaryColor }}>
      <Text>Start</Text>
    </Button>
  </View>
);

ActivitySummary.propTypes = {
  activity: PropTypes.object.isRequired,
  onPressStart: PropTypes.func.isRequired,
  primaryColor: PropTypes.string.isRequired,
};

export default ActivitySummary;
