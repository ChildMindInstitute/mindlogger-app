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

  const initialState = (hour !== null) ? {
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
    let timeoutId = 0;

    let prevTime = Date.now();

    const updateClock = () => {
      let { eventDate, allow } = activityTime;
      if (eventDate <= 0) {
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

        if (timeoutId >= 0) {
          prevTime += 1000;
          timeoutId = setTimeout(updateClock, prevTime - Date.now());
        }
      }
    };

    timeoutId = setTimeout(updateClock, 1000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = -1;
    }
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

