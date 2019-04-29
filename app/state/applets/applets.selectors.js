import { createSelector } from 'reselect';
import * as R from 'ramda';
import { getLastResponseTime, getNextAndLastTimes } from '../../services/time';
import { responsesGroupedByActivitySelector } from '../responses/responses.selectors';

export const appletsSelector = R.path(['applets', 'applets']);

export const isDownloadingAppletsSelector = R.path(['applets', 'isDownloadingApplets']);

export const notificationsSelector = R.path(['applets', 'notifications']);

// Flatten the applet activities into a single list, attaching some extra info
// to each activity
export const activitiesSelector = createSelector(
  appletsSelector,
  responsesGroupedByActivitySelector,
  (applets, responses) => applets.reduce((acc, applet) => {
    const extraInfoActivities = applet.activities.map((act) => {
      const now = Date.now();
      const { last, next } = getNextAndLastTimes(act, now);
      return {
        ...act,
        appletId: applet.id,
        appletShortName: applet.name,
        appletName: applet.name,
        appletSchema: applet.schema,
        appletSchemaVersion: applet.schemaVersion,
        lastScheduledTimestamp: last,
        lastResponseTimestamp: getLastResponseTime(act, responses),
        nextScheduledTimestamp: next,
      };
    });

    return [
      ...acc,
      ...extraInfoActivities,
    ];
  }, []),
);
