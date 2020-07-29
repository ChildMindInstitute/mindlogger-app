import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Parse, Day } from 'dayspan';
import moment from 'moment';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import {
  getLastScheduled,
  getNextScheduled,
  getScheduledNotifications,
} from '../../services/time';
import sortActivities from './sortActivities';
import ActivityListItem from './ActivityListItem';
import { newAppletSelector, currentAppletSelector } from '../../state/app/app.selectors';
import { responseScheduleSelector, inProgressSelector } from '../../state/responses/responses.selectors';

const dateParser = (schedule) => {
  const output = {};
  schedule.events.forEach((e) => {
    const uri = e.data.URI;

    if (!output[uri]) {
      output[uri] = {
        notificationDateTimes: [],
      };
    }

    const eventSchedule = Parse.schedule(e.schedule);
    const now = Day.fromDate(new Date());

    const lastScheduled = getLastScheduled(eventSchedule, now);
    const nextScheduled = getNextScheduled(eventSchedule, now);

    const notifications = R.pathOr([], ['data', 'notifications'], e);
    const dateTimes = getScheduledNotifications(eventSchedule, now, notifications);

    let lastScheduledResponse = lastScheduled;
    let { lastScheduledTimeout } = output[uri];
    let { completion } = output[uri];

    if (lastScheduledResponse) {
      lastScheduledTimeout = e.data.timeout;
      completion = e.data.completion;
    }

    if (output[uri].lastScheduledResponse && lastScheduled) {
      lastScheduledResponse = moment.max(
        moment(output[uri].lastScheduledResponse),
        moment(lastScheduled),
      );
      if (lastScheduledResponse === output[uri].lastScheduledResponse) {
        lastScheduledTimeout = output[uri].lastScheduledTimeout;
        completion = output[uri].completion;
      }
    }

    let nextScheduledResponse = nextScheduled;
    let { nextScheduledTimeout } = output[uri];

    if (nextScheduledResponse) {
      nextScheduledTimeout = e.data.timeout;
    }

    if (output[uri].nextScheduledResponse && nextScheduled) {
      nextScheduledResponse = moment.min(
        moment(output[uri].nextScheduledResponse),
        moment(nextScheduled),
      );
      if (nextScheduledResponse === output[uri].nextScheduledResponse) {
        nextScheduledTimeout = output[uri].nextScheduledTimeout;
      }
    }

    output[uri] = {
      lastScheduledResponse: lastScheduledResponse || output[uri].lastScheduledResponse,
      nextScheduledResponse: nextScheduledResponse || output[uri].nextScheduledResponse,
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
    const oneTimeCompletion = R.pathOr(null, ['completion'], scheduledDateTimes);
    const lastTimeout = R.pathOr(null, ['lastScheduledTimeout'], scheduledDateTimes);
    const nextTimeout = R.pathOr(null, ['nextScheduledTimeout'], scheduledDateTimes);
    const lastResponse = R.path([applet.id, act.id, 'lastResponse'], responseSchedule);
    let nextAccess = false;
    let prevTimeout = null;
    let scheduledTimeout = null;

    if (lastTimeout) {
      prevTimeout = ((lastTimeout.day * 24 + lastTimeout.hour) * 60 + lastTimeout.minute) * 60000;
    }
    if (nextTimeout) {
      nextAccess = nextTimeout.access;
      scheduledTimeout = ((nextTimeout.day * 24 + nextTimeout.hour) * 60
          + nextTimeout.minute)
        * 60000;
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
      currentTime: new Date().getTime(),
      nextAccess,
      isOverdue:
        lastScheduled && moment(lastResponse) < moment(lastScheduled),

      // also add in our parsed notifications...
      notification: R.prop('notificationDateTimes', scheduledDateTimes),
    };
  });

  return {
    ...applet,
    activities: extraInfoActivities,
  };
};

// const useForeJobs = (callback) => {
//   const savedCallback = useRef();

//   useEffect(() => {
//     savedCallback.current = callback;
//   });

//   useEffect(() => {
//     function tick() {
//       savedCallback.current();
//     }

//     const id = setInterval(tick, 1000);
//     return () => clearInterval(id);
//   }, []);
// }

const useInterval = (callback, delay, progress, response) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id;
    const leftTime = (60 - new Date().getSeconds()) * 1000;
    const leftOutId = setTimeout(() => {
      tick();
      id = setInterval(tick, delay);
    }, leftTime);

    return () => {
      clearTimeout(leftOutId);
      if (id) {
        clearInterval(id);
      }
    };
  }, [progress, response]);
};

const ActivityList = ({ applet, appStatus, currentApplet, responseSchedule, inProgress, onPressActivity }) => {
  // const newApplet = getActivities(applet.applet, responseSchedule);
  const delay = 60 * 1000;
  const [activities, setActivities] = useState([]);

  const stateUpdate = () => {
    const newApplet = getActivities(applet, responseSchedule);
    setActivities(sortActivities(applet.id, newApplet.activities, inProgress, newApplet.schedule));
  };

  useInterval(stateUpdate, delay, Object.keys(inProgress).length, responseSchedule);

  useEffect(() => {
    if (appStatus === true) {
      stateUpdate();
    }
  }, [appStatus]);

  useEffect(() => {
    stateUpdate();
  }, [Object.keys(inProgress).length, responseSchedule]);

  return (
    <View style={{ paddingBottom: 30 }}>
      {activities.map(activity => (
        <ActivityListItem
          onPress={() => onPressActivity(activity)}
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
  currentApplet: PropTypes.object.isRequired,
  responseSchedule: PropTypes.object.isRequired,
  inProgress: PropTypes.object.isRequired,
  onPressActivity: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    appStatus: state.app.appStatus,
    applet: newAppletSelector(state),
    currentApplet: currentAppletSelector(state),
    responseSchedule: responseScheduleSelector(state),
    inProgress: inProgressSelector(state),
  };
};
export default connect(mapStateToProps)(ActivityList);
