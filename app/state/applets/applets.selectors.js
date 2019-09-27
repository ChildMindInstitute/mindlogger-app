import { createSelector } from 'reselect';
import * as R from 'ramda';
import { Parse, Day } from 'dayspan';
import moment from 'moment';
import { getLastResponseTime, getNextAndLastTimes } from '../../services/time';
import { responsesGroupedByActivitySelector } from '../responses/responses.selectors';

// import console = require('console');

export const dateParser = (schedule) => {
  // output is an object indexed by URIs.
  const output = {};
  schedule.events.map((e) => {
    const uri = e.data.URI;


    if (!output[uri]) {
      output[uri] = [];
    }

    let { notifications } = e.data;
    notifications = notifications || [];
    // TODO: e.data might have some flag saying its relative to
    // the first response. update the schedule here before parsing it.
    // this might be kind of hard.
    const eventSchedule = Parse.schedule(e.schedule);
    const today = Day.fromDate(new Date());
    const dates = eventSchedule.forecast(today, false, 4, 0).map(d => d[2]).array();
    const dateTimes = [];
    // create a list of datetimes
    // for each date in dates and
    // for each notification in notifications
    // TODO: handle random notification times (if n.random is true,
    // then generate a time between n.start and n.end)
    dates.map(date => notifications.map(n => dateTimes.push(moment(`${date[2]} ${n.start}`, 'YYYYMMDD HH:mm'))));
    // TODO: only append unique datetimes
    output[uri] = output[uri].concat(dateTimes);
    return 0;
  });
  return output;
};

// Attach some info to each activity
export const appletsSelector = createSelector(
  R.path(['applets', 'applets']),
  responsesGroupedByActivitySelector,
  (applets, responses) => applets.map((applet) => {
    // applet.schedule, if defined, has an events key.
    // events is a list of objects.
    // the events[idx].data.URI points to the specific activity's schema.

    let notificationDateTimesByActivity = {};
    if (applet.schedule) {
      notificationDateTimesByActivity = dateParser(applet.schedule);
    }

    const extraInfoActivities = applet.activities.map((act) => {
      const now = Date.now();
      const { last, next } = getNextAndLastTimes(act, now);
      const lastResponse = getLastResponseTime(act, responses);
      // add in our parsed notifications here.

      // eslint-disable-next-line
      act.notification = notificationDateTimesByActivity[act.schema];

      return {
        ...act,
        appletId: applet.id,
        appletShortName: applet.name,
        appletName: applet.name,
        appletSchema: applet.schema,
        appletSchemaVersion: applet.schemaVersion,
        lastScheduledTimestamp: last,
        lastResponseTimestamp: lastResponse,
        nextScheduledTimestamp: next,
        isOverdue: last && lastResponse < last,
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
