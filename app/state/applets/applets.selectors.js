import { createSelector } from 'reselect';
import * as R from 'ramda';
import { getLastResponseTime, getNextAndLastTimes } from '../../services/time';
import { responsesGroupedByActivitySelector } from '../responses/responses.selectors';

// Attach some info to each activity
export const appletsSelector = createSelector(
  R.path(['applets', 'applets']),
  responsesGroupedByActivitySelector,
  (applets, responses) => applets.map((applet) => {
    const extraInfoActivities = applet.activities.map((act) => {
      const now = Date.now();
      const { last, next } = getNextAndLastTimes(act, now);
      const lastResponse = getLastResponseTime(act, responses);
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
