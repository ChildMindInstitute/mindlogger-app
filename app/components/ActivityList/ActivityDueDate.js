import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import i18n from 'i18next';
import moment from 'moment';
import { LittleText } from '../core';
import { scheduledEndTime } from '../../services/time';

const styles = StyleSheet.create({
  textStyles: {
    marginTop: 6,
  },
});

const ActivityDueDate = ({ activity }) => {
  if (activity.status === 'scheduled' && activity.event) {
    return (
      <LittleText style={styles.textStyles}>
        {!activity.event.data.timeout.allow
          ? `${i18n.t('activity_due_date:scheduled_at')} ${moment(activity.event.scheduledTime).format('hh:mm a')}`
          : `${i18n.t('activity_due_date:available')} ${moment(activity.event.scheduledTime).format('hh:mm a')} ${i18n.t(
            'activity_due_date:to',
          )} ${scheduledEndTime(activity.event.scheduledTime, activity.event.data.timeout)}`}
      </LittleText>
    );
  }
  if (activity.status === 'pastdue') {
    return (
      <LittleText style={styles.textStyles}>
        {`${i18n.t('activity_due_date:to')} ${scheduledEndTime(activity.event.scheduledTime)}`}
      </LittleText>
    );
  }

  return null;
};

ActivityDueDate.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default ActivityDueDate;
