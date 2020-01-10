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
    if (output[uri].lastScheduledResponse && lastScheduled) {
      lastScheduledResponse = moment.max(moment(output[uri].lastScheduledResponse), moment(lastScheduled));
    }

    let nextScheduledResponse = nextScheduled;
    if (output[uri].nextScheduledResponse && nextScheduled) {
      nextScheduledResponse = moment.min(moment(output[uri].nextScheduledResponse), moment(nextScheduled));
    }

    output[uri] = {
      lastScheduledResponse,
      nextScheduledResponse,

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
      const lastResponse = R.path([applet.id, act.id, 'lastResponse'], responseSchedule);

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
        isOverdue: lastScheduled && moment(lastResponse) < moment(lastScheduled),

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

export const appletDataSelector = R.path(['applets', 'appletResponseData']);
