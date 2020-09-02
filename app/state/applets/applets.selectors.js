import { createSelector } from 'reselect';
import * as R from 'ramda';
import { Parse, Day } from 'dayspan';
import moment from 'moment';
import {
  getLastScheduled,
  getNextScheduled,
  getScheduledNotifications,
} from '../../services/time';
import { responseScheduleSelector } from '../responses/responses.selectors';

export const dateParser = (schedule) => {
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
    let { extendedTime } = output[uri];
    let { invalid } = output[uri];
    let { completion } = output[uri];

    if (lastScheduledResponse) {
      lastScheduledTimeout = e.data.timeout;
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
        invalid = output[uri].valid;
        completion = output[uri].completion;
        extendedTime = output[uri].extendedTime;
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

// Attach some info to each activity
export const appletsSelector = createSelector(
  R.path(['applets', 'applets']),
  responseScheduleSelector,
  (applets, responseSchedule) => applets.map((applet) => {
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
      const extendedTime = R.pathOr(null, ['extendedTime'], scheduledDateTimes);
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
        extendedTime,
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
  }),
);

export const isDownloadingAppletsSelector = R.path(['applets', 'isDownloadingApplets']);

export const isDownloadingTargetAppletSelector = R.path(['applets', 'isDownloadingTargetApplet']);

export const notificationsSelector = R.path(['applets', 'notifications']);

export const invitesSelector = R.path(['applets', 'invites']);

export const currentInviteSelector = R.path(['applets', 'currentInvite']);

// Flatten the applet activities into a single list
export const activitiesSelector = createSelector(
  appletsSelector,
  applets => applets.reduce(
    (acc, applet) => [
      ...acc,
      ...applet.activities,
    ],
    [],
  ),
);

export const allAppletsSelector = R.path(['applets', 'applets']);

export const currentTimeSelector = R.path(['applets', 'currentTime']);

export const appletDataSelector = R.path(['applets', 'appletResponseData']);
