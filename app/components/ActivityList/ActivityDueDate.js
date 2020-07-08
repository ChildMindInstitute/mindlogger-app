import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { LittleText } from '../core';
import { scheduledTime } from '../../services/time';

const styles = StyleSheet.create({
  textStyles: {
    marginTop: 6,
  },
});

const ActivityDueDate = ({ activity }) => {
  const nextScheduledTime = scheduledTime(activity.nextScheduledTimestamp);
  if (
    (activity.status === 'scheduled' || activity.status === 'in-progress')
    && activity.nextScheduledTimestamp
    && nextScheduledTime
  ) {
    return (
      <LittleText style={styles.textStyles}>
        Scheduled for: {nextScheduledTime}
      </LittleText>
    );
  }
  if (activity.status === 'completed') {
    return (
      <LittleText style={styles.textStyles}>
        Last completed: {nextScheduledTime}
      </LittleText>
    );
  }
  return null;
};

ActivityDueDate.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default ActivityDueDate;
