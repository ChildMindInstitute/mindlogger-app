import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Text } from 'native-base';
import moment from 'moment';
import { colors } from '../../theme';
import { LittleText } from '../core';

const formatTime = (timestamp) => {
  const time = moment(timestamp);
  if (moment().isSame(time, 'day')) {
    return moment(timestamp).format('[Today at] h:mm A');
  }
  return moment(timestamp).format('MMMM D');
};

const styles = StyleSheet.create({
  textStyles: {
    marginTop: 6,
  },
});

const ActivityDueDate = ({ activity }) => {
  if (activity.lastResponseTimestamp < activity.lastScheduledTimestamp) {
    return (
      <LittleText style={{ ...styles.textStyles, color: colors.alert }}>
        {formatTime(activity.lastScheduledTimestamp)}
      </LittleText>
    );
  }
  if (activity.status === 'scheduled') {
    return (
      <LittleText style={styles.textStyles}>
        {formatTime(activity.nextScheduledTimestamp)}
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
