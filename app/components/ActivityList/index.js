// Third-party libraries.
import React, { useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Parse, Day } from 'dayspan';
import moment from 'moment';
import PropTypes from 'prop-types';
import { View } from 'react-native';

// Local.
import { getLastScheduled, getNextScheduled, getScheduledNotifications } from '../../services/time';
import { delayedExec, clearExec } from '../../services/timing';
import sortActivities from './sortActivities';
import ActivityListItem from './ActivityListItem';
import {
  newAppletSelector,
  activitySelectionDisabledSelector,
} from '../../state/app/app.selectors';
import { getSchedules, setReminder } from '../../state/applets/applets.thunks';
import { syncUploadQueue } from '../../state/app/app.thunks';
import { setUpdatedTime, setAppStatus } from '../../state/app/app.actions';
import { setScheduleUpdated } from '../../state/applets/applets.actions';
import {
  responseScheduleSelector,
  inProgressSelector,
} from '../../state/responses/responses.selectors';

const dateParser = (schedule) => {
  const output = {};
  schedule.events.forEach((e) => {
    const uri = e.data.URI;

    if (!output[uri]) {
      output[uri] = {
        notificationDateTimes: [],
        invalid: e.valid,
      };
    }

    const eventSchedule = Parse.schedule(e.schedule);
    const now = Day.fromDate(new Date());

    const lastScheduled = getLastScheduled(eventSchedule, now);
    const nextScheduled = getNextScheduled(eventSchedule, now);

    const notifications = R.pathOr([], ['data', 'notifications'], e);
    const dateTimes = getScheduledNotifications(eventSchedule, now, notifications);

    let lastScheduledResponse = lastScheduled;
    let {
      lastScheduledTimeout, lastTimedActivity, extendedTime, invalid, completion
    } = output[uri];

    if (lastScheduledResponse) {
      lastScheduledTimeout = e.data.timeout;
      lastTimedActivity = e.data.timedActivity;
      completion = e.data.completion;
      invalid = e.valid;
      extendedTime = e.data.extendedTime;
    }

    if (output[uri].lastScheduledResponse && lastScheduled) {
      lastScheduledResponse = moment.max(
        moment(output[uri].lastScheduledResponse),
        moment(lastScheduled),
      );
      if (lastScheduledResponse === output[uri].lastScheduledResponse) {
        lastScheduledTimeout = output[uri].lastScheduledTimeout;
        lastTimedActivity = output[uri].lastTimedActivity;
        invalid = output[uri].valid;
        completion = output[uri].completion;
        extendedTime = output[uri].extendedTime;
      }
    }

    let nextScheduledResponse = nextScheduled;
    let { nextScheduledTimeout, nextTimedActivity } = output[uri];

    if (nextScheduledResponse) {
      nextScheduledTimeout = e.data.timeout;
      nextTimedActivity = e.data.timedActivity;
    }

    if (output[uri].nextScheduledResponse && nextScheduled) {
      nextScheduledResponse = moment.min(
        moment(output[uri].nextScheduledResponse),
        moment(nextScheduled),
      );
      if (nextScheduledResponse === output[uri].nextScheduledResponse) {
        nextScheduledTimeout = output[uri].nextScheduledTimeout;
        nextTimedActivity = output[uri].nextTimedActivity;
      }
    }

    output[uri] = {
      lastScheduledResponse: lastScheduledResponse || output[uri].lastScheduledResponse,
      nextScheduledResponse: nextScheduledResponse || output[uri].nextScheduledResponse,
      lastTimedActivity,
      nextTimedActivity,
      extendedTime,
      invalid,
      lastScheduledTimeout,
      nextScheduledTimeout,
      completion,
      // TODO: only append unique datetimes when multiple events scheduled for same activity/URI
      notificationDateTimes: output[uri].notificationDateTimes.concat(dateTimes),
    };
  });

  return output;
};

const getActivities = (applet, responseSchedule) => {
  let scheduledDateTimesByActivity = {};
  // applet.schedule, if defined, has an events key.
  // events is a list of objects.
  // the events[idx].data.URI points to the specific activity's schema.
  if (applet.schedule) {
    scheduledDateTimesByActivity = dateParser(applet.schedule);
  }

  const extraInfoActivities = applet.activities.map((act) => {
    const scheduledDateTimes = scheduledDateTimesByActivity[act.schema];
    const nextScheduled = R.pathOr(null, ['nextScheduledResponse'], scheduledDateTimes);
    const lastScheduled = R.pathOr(null, ['lastScheduledResponse'], scheduledDateTimes);
    const nextTimedActivity = R.pathOr(null, ['nextTimedActivity'], scheduledDateTimes);
    const lastTimedActivity = R.pathOr(null, ['lastTimedActivity'], scheduledDateTimes);
    const oneTimeCompletion = R.pathOr(null, ['completion'], scheduledDateTimes);
    const lastTimeout = R.pathOr(null, ['lastScheduledTimeout'], scheduledDateTimes);
    const nextTimeout = R.pathOr(null, ['nextScheduledTimeout'], scheduledDateTimes);
    const invalid = R.pathOr(null, ['invalid'], scheduledDateTimes);
    const extendedTime = R.pathOr(null, ['extendedTime'], scheduledDateTimes);

    const lastResponse = R.path([applet.id, act.id, 'lastResponse'], responseSchedule);
    let nextAccess = false;
    let prevTimeout = null;
    let scheduledTimeout = null;

    if (lastTimeout) {
      prevTimeout = ((lastTimeout.day * 24 + lastTimeout.hour) * 60 + lastTimeout.minute) * 60000;
    }
    if (nextTimeout) {
      nextAccess = nextTimeout.access;
      scheduledTimeout = ((nextTimeout.day * 24 + nextTimeout.hour) * 60 + nextTimeout.minute) * 60000;
    }

    return {
      ...act,
      appletId: applet.id,
      appletShortName: applet.name,
      appletName: applet.name,
      appletSchema: applet.schema,
      appletSchemaVersion: applet.schemaVersion,
      lastScheduledTimestamp: lastScheduled,
      lastResponseTimestamp: lastResponse,
      nextScheduledTimestamp: nextScheduled,
      oneTimeCompletion: oneTimeCompletion || false,
      lastTimeout: prevTimeout,
      nextTimeout: scheduledTimeout,
      nextTimedActivity,
      lastTimedActivity,
      currentTime: new Date().getTime(),
      invalid,
      extendedTime,
      nextAccess,
      isOverdue: lastScheduled && moment(lastResponse) < moment(lastScheduled),

      // also add in our parsed notifications...
      notification: R.prop('notificationDateTimes', scheduledDateTimes),
    };
  });

  return {
    ...applet,
    activities: extraInfoActivities,
  };
};

const ActivityList = ({
  applet,
  syncUploadQueue,
  appStatus,
  setAppStatus,
  getSchedules,
  setReminder,
  scheduleUpdated,
  setScheduleUpdated,
  setUpdatedTime,
  appletTime,
  lastUpdatedTime,
  responseSchedule,
  inProgress,
  onPressActivity,
  onLongPressActivity,
}) => {
  // const newApplet = getActivities(applet.applet, responseSchedule);
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  const updateStatusDelay = 60 * 1000;
  const updateScheduleDelay = 24 * 3600 * 1000;

  const stateUpdate = () => {
    const newApplet = getActivities(applet, responseSchedule);

    setActivities(sortActivities(applet.id, newApplet.activities, inProgress, newApplet.schedule));
  };

  const datesAreOnSameDay = (first, second) => first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();

  const scheduleUpdate = () => {
    const currentTime = new Date();
    const appletId = applet.id;

    if (lastUpdatedTime[appletId]) {
      if (!datesAreOnSameDay(new Date(lastUpdatedTime[appletId]), currentTime)) {
        const updatedTime = lastUpdatedTime;
        updatedTime[appletId] = currentTime;
        getSchedules(appletId.split('/')[1]);
        setUpdatedTime(updatedTime);
      } else {
        const updatedTime = lastUpdatedTime;
        updatedTime[appletId] = currentTime;
        setUpdatedTime(updatedTime);
      }
    } else if (!datesAreOnSameDay(appletTime, currentTime)) {
      const updatedTime = lastUpdatedTime;
      updatedTime[appletId] = appletTime;

      getSchedules(appletId.split('/')[1]);
      setUpdatedTime(updatedTime);
    } else {
      const updatedTime = lastUpdatedTime;
      updatedTime[appletId] = appletTime;

      setUpdatedTime(updatedTime);
    }
  };

  const handleConnectivityChange = (connection) => {
    if (connection.isConnected) {
      syncUploadQueue();
      setIsConnected(true);
    } else {
      setIsConnected(false);
      setReminder();
    }
  }

  // useInterval(stateUpdate, updateStatusDelay, Object.keys(inProgress).length, responseSchedule);

  useEffect(() => {
    let updateId;
    let intervalId;
    const leftTime = (60 - new Date().getSeconds()) * 1000;
    const leftOutId = delayedExec(
      () => {
        stateUpdate();
        updateId = delayedExec(stateUpdate, { every: updateStatusDelay });
      },
      { after: leftTime },
    );

    const currentTime = new Date();
    const nextDay = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate() + 1,
    );
    const leftTimeout = nextDay.getTime() - currentTime.getTime() + 1000;

    const leftTimeoutId = delayedExec(
      () => {
        scheduleUpdate();
        intervalId = delayedExec(scheduleUpdate, { every: updateScheduleDelay });
      },
      { after: leftTimeout },
    );

    const netInfoUnsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      if (netInfoUnsubscribe) {
        netInfoUnsubscribe();
      }

      clearExec(leftOutId);
      if (updateId) {
        clearExec(updateId);
      }

      clearExec(leftTimeoutId);
      if (intervalId) {
        clearExec(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    if (appStatus) {
      stateUpdate();
      setAppStatus(false);
    }
  }, [appStatus]);

  useEffect(() => {
    if (scheduleUpdated) {
      stateUpdate();
      setScheduleUpdated(false);
    }
  }, [applet.schedule]);

  useEffect(() => {
    stateUpdate();
  }, [Object.keys(inProgress).length, responseSchedule]);

  return (
    <View style={{ paddingBottom: 30 }}>
      {activities.map(activity => (
        <ActivityListItem
          disabled={activity.status === 'scheduled' && !activity.nextAccess}
          onPress={() => onPressActivity(activity)}
          onLongPress={() => onLongPressActivity(activity)}
          activity={activity}
          key={activity.id || activity.text}
        />
      ))}
    </View>
  );
};

ActivityList.propTypes = {
  applet: PropTypes.object.isRequired,
  appStatus: PropTypes.bool.isRequired,
  setAppStatus: PropTypes.func.isRequired,
  responseSchedule: PropTypes.object.isRequired,
  appletTime: PropTypes.any.isRequired,
  inProgress: PropTypes.object.isRequired,
  onPressActivity: PropTypes.func.isRequired,
  onLongPressActivity: PropTypes.func.isRequired,
  lastUpdatedTime: PropTypes.object.isRequired,
  setUpdatedTime: PropTypes.func.isRequired,
  getSchedules: PropTypes.func.isRequired,
  setScheduleUpdated: PropTypes.func.isRequired,
  scheduleUpdated: PropTypes.bool.isRequired,
  syncUploadQueue: PropTypes.func.isRequired,
  setReminder: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    lastUpdatedTime: state.app.lastUpdatedTime,
    appStatus: state.app.appStatus,
    scheduleUpdated: state.applets.scheduleUpdated,
    applet: newAppletSelector(state),
    appletTime: state.applets.currentTime,
    activitySelectionDisabled: activitySelectionDisabledSelector(state),
    responseSchedule: responseScheduleSelector(state),
    inProgress: inProgressSelector(state),
  };
};

// const mapDispatchToProps = dispatch => ({
//   setUpdatedTime: updatedTime => dispatch(setUpdatedTime(updatedTime)),
//   getSchedules,
// });
const mapDispatchToProps = {
  setUpdatedTime,
  getSchedules,
  setAppStatus,
  setScheduleUpdated,
  syncUploadQueue,
  setReminder,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActivityList);
