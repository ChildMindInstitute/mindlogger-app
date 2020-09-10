import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { LittleText } from '../core';
import {
  scheduledTime,
  scheduledEndTime,
  lastScheduledTime,
  lastScheduledEndTime,
} from '../../services/time';

const styles = StyleSheet.create({
  textStyles: {
    marginTop: 6,
  },
});

const ActivityDueDate = ({ activity }) => {
  const nextScheduledTime = scheduledTime(activity.nextScheduledTimestamp);
  const nextScheduledEndTime = scheduledEndTime(activity.nextScheduledTimestamp, activity.nextTimeout);
  const prevScheduledTime = lastScheduledTime(
    activity.lastScheduledTimestamp,
  );
  const prevScheduledEndTime = lastScheduledEndTime(
    activity.lastScheduledTimestamp,
    activity.lastTimeout,
  );
  if (
    (activity.status === 'scheduled')
    && activity.nextScheduledTimestamp
    && nextScheduledTime
  ) {
    return (
      <LittleText style={styles.textStyles}>
        {activity.nextTimeout === 86340000
          ? 'Available: All day'
          : `Available: ${nextScheduledTime} to ${nextScheduledEndTime}`}
      </LittleText>
    );
  }
  if (activity.status === 'pastdue' && activity.extendedTime && activity.extendedTime.allow) {
    const leftDays = activity.extendedTime.days - Math.floor(Math.abs(new Date() - activity.lastScheduledTimestamp) / (1000 * 60 * 60 * 24));
    return (
      <LittleText style={styles.textStyles}>
        {leftDays > 0
          ? leftDays === 1
            ? `Available: ${leftDays} day`
            : `Available: ${leftDays} days`
          : `Available: 12:00 AM to ${prevScheduledEndTime}`}
      </LittleText>
    );
  }
  if (
    activity.status === 'pastdue'
    && (activity.lastTimeout === 86340000
      || (prevScheduledTime && prevScheduledEndTime))
  ) {
    return (
      <LittleText style={styles.textStyles}>
        {activity.lastTimeout === 86340000
          ? 'Available: All day'
          : `Available: ${prevScheduledTime} to ${prevScheduledEndTime}`}
      </LittleText>
    );
  }
  return null;
};

ActivityDueDate.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default ActivityDueDate;
