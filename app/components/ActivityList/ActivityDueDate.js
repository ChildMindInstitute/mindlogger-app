import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { LittleText } from '../core';
import { formatTime } from '../../services/time';

const styles = StyleSheet.create({
  textStyles: {
    marginTop: 6,
  },
});

const ActivityDueDate = ({ activity }) => {
  if (activity.status === 'scheduled') {
    return (
      <LittleText style={styles.textStyles}>
        Scheduled for: {formatTime(activity.nextScheduledTimestamp)}
      </LittleText>
    );
  }
  if (activity.status === 'completed') {
    return (
      <LittleText style={styles.textStyles}>
        Last completed: {formatTime(activity.lastResponseTimestamp)}
      </LittleText>
    );
  }
  return null;
};

ActivityDueDate.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default ActivityDueDate;
