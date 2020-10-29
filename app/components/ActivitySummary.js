import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Button, Icon } from 'native-base';
import i18n from 'i18next';
import { BodyText, SubHeading } from './core';
import { colors } from '../themes/colors';
import theme from '../themes/base-theme';
import { formatTime } from '../services/time';
import BaseText from './base_text/base_text';

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
    return i18n.t('activity_summary:not_yet_completed');
  }
  return `${i18n.t('activity_summary:last_completed')} ${formatTime(timestamp)}`;
};

const nextScheduledString = (activity) => {
  if (!activity.nextScheduledTimestamp) {
    return i18n.t('activity_summary:unscheduled');
  }
  if (activity.isOverdue) {
    return `${i18n.t('activity_summary:due')} ${formatTime(activity.lastScheduledTimestamp)}`;
  }
  return `${i18n.t('activity_summary:scheduled_for')} ${formatTime(
    activity.nextScheduledTimestamp,
  )}`;
};

const ActivitySummary = ({ activity, onPressStart, primaryColor }) => (
  <View style={styles.box}>
    <SubHeading>{activity.name.en}</SubHeading>
    <BodyText style={styles.description}>{activity.description.en}</BodyText>
    <View style={styles.lockup}>
      <Icon type="FontAwesome" name="calendar" style={styles.icon} />
      <BodyText>{nextScheduledString(activity)}</BodyText>
    </View>
    <View style={styles.lockup}>
      <Icon type="FontAwesome" name="history" style={styles.icon} />
      <BodyText>{lastCompletedString(activity.lastResponseTimestamp)}</BodyText>
    </View>
    <Button onPress={onPressStart} full rounded style={{ backgroundColor: primaryColor }}>
      <BaseText textKey="activity_summary:save" />
    </Button>
  </View>
);

ActivitySummary.propTypes = {
  activity: PropTypes.object.isRequired,
  onPressStart: PropTypes.func.isRequired,
  primaryColor: PropTypes.string.isRequired,
};

export default ActivitySummary;
