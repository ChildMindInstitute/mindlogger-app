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
  const { event } = activity

  if (activity.status === 'scheduled' && event && event.data.timedActivity.allow) {
    let { hour, minute, allow } = event.data.timedActivity;

    return (
      <LittleText style={styles.textStyles}>
      
        {allow ? `${i18n.t('timed_activity:time_to_complete')}: ${ hour } ${i18n.t('timed_activity:hours')} and ${ minute } minutes ` : ``}
      </LittleText>
    );
  }
  if (activity.status === 'pastdue' && event && event.data.timedActivity.allow) {
    let { hour, minute, allow } = event.data.timedActivity;

    return (
      <LittleText style={styles.textStyles}>
        {allow ? `${i18n.t('timed_activity:time_to_complete')}: ${ hour } ${i18n.t('timed_activity:hours')} and ${ minute } minutes ` : ``}
      </LittleText>
    );
  }
  if (activity.status === 'in-progress' && event && event.data.timedActivity.allow ) {
    let { hour, minute, second, allow } = event.data.timedActivity;
    const startedTime = startedTimes ? startedTimes[activity.id + event.id] : null;

    if (startedTime && allow) {
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

