import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';

import { finishActivity } from '../../state/responses/responses.thunks';
import { startedTimesSelector } from '../../state/app/app.selectors';

const styles = StyleSheet.create({
  remainingTime: {
    marginTop: 42,
    marginLeft: 10,
    color: 'red',
  },
});

const ActivityTime = ({ activity, startedTimes, finishActivity }) => {
  let { hour, minute, second, allow } = activity.lastTimedActivity;
  const startedTime = startedTimes ? startedTimes[activity.id] : null;
  if (startedTime && allow) {
    const activityTime = hour * (60000 * 60) + minute * 60000 + second * 1000;
    const difference = Math.abs(Date.now() - startedTime);
    if (activityTime > difference) {
      hour = Math.floor((activityTime - difference) / 60000 / 60);
      minute = Math.floor(((activityTime - difference) % (60000 * 60)) / 60000);
      second = Math.floor(((activityTime - difference) % 60000) / 1000);
    } else {
      hour = null;
    }
  } else {
    hour = null;
  }
  const initialState = (!startedTime || hour !== null) ? {
    eventDate: moment.duration().add({
      hours: hour,
      minutes: minute,
      seconds: second
    }),
    hours: hour,
    mins: minute,
    secs: second,
    allow: true
  } : null;

  const [activityTime, setActivityTime] = useState(initialState);

  useEffect(() => {
    if (!activityTime) return;
    const intervalId = setInterval(() => {
      let { eventDate, allow } = activityTime;
      if (eventDate <= 0) {
        clearInterval(intervalId);
        finishActivity(activity);
      } else {
        eventDate = eventDate.subtract(1, "s");
        const hours = eventDate.hours();
        const mins = eventDate.minutes();
        const secs = eventDate.seconds();

        setActivityTime({
          eventDate,
          hours,
          mins,
          secs,
          allow
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Text style={styles.remainingTime}>
      {activityTime && `Time remaining: ${activityTime.hours}:${activityTime.mins}:${activityTime.secs}`}
    </Text>
  );
};

ActivityTime.propTypes = {
  activity: PropTypes.object.isRequired,
  finishActivity: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  startedTimes: startedTimesSelector(state),
});

const mapDispatchToProps = {
  finishActivity,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActivityTime);

