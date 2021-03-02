import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import i18n from 'i18next';
import { LittleText } from '../core';
import { Actions } from "react-native-router-flux";
import { startedTimesSelector } from '../../state/app/app.selectors';
import { endActivity } from '../../state/responses/responses.thunks';

const styles = StyleSheet.create({
  textStyles: {
    marginTop: 6,
  },
});

const TimedActivity = ({ activity, startedTimes, endActivity }) => {
  const { lastTimedActivity, nextTimedActivity } = activity
  if (activity.status === 'scheduled' && activity.nextScheduledTimestamp && nextTimedActivity) {
    return (
      <LittleText style={styles.textStyles}>
      
        {(nextTimedActivity && nextTimedActivity.allow) ? `${i18n.t('timed_activity:time_to_complete')}: ${ nextTimedActivity.hour } ${i18n.t('timed_activity:hours')} and ${ nextTimedActivity.minute } minutes ` : ``}
      </LittleText>
    );
  }
  if (activity.status === 'pastdue' && activity.lastScheduledTimestamp && lastTimedActivity) {
    return (
      <LittleText style={styles.textStyles}>
        {(lastTimedActivity && lastTimedActivity.allow) ? `${i18n.t('timed_activity:time_to_complete')}: ${ lastTimedActivity.hour } ${i18n.t('timed_activity:hours')} and ${ lastTimedActivity.minute } minutes ` : ``}
      </LittleText>
    );
  }
  if (activity.status === 'in-progress' && activity.lastScheduledTimestamp && lastTimedActivity) {
    let { hour, minute, second } = activity.lastTimedActivity;
    const startedTime = startedTimes ? startedTimes[activity.id] : null;

    if (startedTime && activity.lastTimedActivity.allow) {
      const activityTime = hour * (60000 * 60) + minute * 60000 + second * 1000;
      const difference = Math.abs(Date.now() - startedTime);

      if (activityTime > difference) {
        hour = Math.floor((activityTime - difference) / 60000 / 60);
        minute = Math.floor(((activityTime - difference) % (60000 * 60)) / 60000);
      } else {
        hour = null;

        if (Actions.currentScene == 'applet_details') {
          endActivity(activity);
        }
      }
    } else {
      hour = null;
    }

    return (
      <LittleText style={styles.textStyles}>
        {(!startedTime || hour !== null) ? `${i18n.t('timed_activity:time_to_complete')}: ${ hour } ${i18n.t('timed_activity:hours')} and ${ minute } minutes` : ``}
      </LittleText>
    )
  }
  return null;
};

TimedActivity.propTypes = {
  activity: PropTypes.object.isRequired,
  startedTimes: PropTypes.object.isRequired,
  endActivity: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  startedTimes: startedTimesSelector(state),
});

const mapDispatchToProps = {
  endActivity,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TimedActivity);

