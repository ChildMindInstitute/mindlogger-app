import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import i18n from 'i18next';
import { LittleText } from '../core';
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
        {` Time to Complete: ${ nextTimedActivity.hour } hours and ${ nextTimedActivity.minute } minutes `}
      </LittleText>
    );
  }
  if (activity.status === 'pastdue' && activity.lastScheduledTimestamp && lastTimedActivity) {
    return (
      <LittleText style={styles.textStyles}>
        {` Time to Complete: ${ lastTimedActivity.hour } hours and ${ lastTimedActivity.minute } minutes `}
      </LittleText>
    );
  }
  if (activity.status === 'in-progress' && activity.lastScheduledTimestamp && lastTimedActivity) {
    let { hour, minute, second } = activity.lastTimedActivity;

    const startedTime = startedTimes[activity.id];

    if (startedTime) {
      const activityTime = hour * (60000 * 60) + minute * 60000 + second * 1000;
      const difference = Math.abs(Date.now() - startedTime);

      if (activityTime > difference) {
        hour = Math.floor((activityTime - difference) / 60000 / 60);
        minute = Math.floor(((activityTime - difference) % (60000 * 60)) / 60000);
      } else {
        hour = null;
        endActivity(activity);
      }
    }

    return (
      <LittleText style={styles.textStyles}>
        {hour !== null ? `Time to Complete: ${ hour } hours and ${ minute } minutes` : ``}
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

