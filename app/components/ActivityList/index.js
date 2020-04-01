import React, { useState, useEffect } from 'react';
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
import { newAppletSelector } from '../../state/app/app.selectors';

// const useInterval = ({ callback, delay }) => {
//   // const savedCallback = useRef();

//   // // Remember the latest callback.
//   // useEffect(() => {
//   //   savedCallback.current = callback;
//   // }, [callback]);
 
//   // Set up the interval.
//   useEffect(() => {
//     if (delay !== null) {
//       const id = setInterval(callback, delay);
//       return () => clearInterval(id);
//     }
//   }, [delay]);
// };

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

    if (lastScheduledResponse) {
      lastScheduledTimeout = e.data.timeout;
    }

    if (output[uri].lastScheduledResponse && lastScheduled) {
      lastScheduledResponse = moment.max(
        moment(output[uri].lastScheduledResponse),
        moment(lastScheduled),
      );
      lastScheduledTimeout = e.data.timeout;
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
      nextScheduledTimeout = e.data.timeout;
    }

    output[uri] = {
      lastScheduledResponse: lastScheduledResponse || output[uri].lastScheduledResponse,
      nextScheduledResponse: nextScheduledResponse || output[uri].nextScheduledResponse,
      lastScheduledTimeout,
      nextScheduledTimeout,
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
    let lastTimeout = R.pathOr(null, ['lastScheduledTimeout'], scheduledDateTimes);
    let nextTimeout = R.pathOr(null, ['nextScheduledTimeout'], scheduledDateTimes);
    const lastResponse = R.path([applet.id, act.id, 'lastResponse'], responseSchedule);

    if (lastTimeout) {
      lastTimeout = ((lastTimeout.day * 24 + lastTimeout.hour) * 60 + lastTimeout.minute) * 60000;
    }

    if (nextTimeout) {
      nextTimeout = nextTimeout.access;
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
      lastTimeout,
      currentTime: new Date().getTime(),
      nextAccess: nextTimeout,
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

const ActivityList = ({ applet, responseSchedule, inProgress, onPressActivity }) => {
  // const newApplet = getActivities(applet.applet, responseSchedule);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // const intervalId = setInterval(() => {
    const newApplet = getActivities(applet.applet, responseSchedule);
    setActivities(sortActivities(newApplet.activities, inProgress, newApplet.schedule));
    // }, 1000);
    // return () => clearInterval(intervalId);
  }, [inProgress, responseSchedule]);

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
  responseSchedule: PropTypes.object.isRequired,
  inProgress: PropTypes.object.isRequired,
  onPressActivity: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    applet: newAppletSelector(state),
    responseSchedule: state.responses.schedule,
    inProgress: state.responses.inProgress,
  };
};
export default connect(mapStateToProps)(ActivityList);
