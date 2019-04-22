import { createSelector } from 'reselect';
import * as R from 'ramda';
import { getLastResponseTime, getNextAndLastTimes } from '../../services/time';
import { responsesGroupedByActivitySelector } from '../responses/responses.selectors';

export const appletsSelector = R.path(['applets', 'applets']);

export const isDownloadingAppletsSelector = R.path(['applets', 'isDownloadingApplets']);

export const downloadProgressSelector = R.path(['applets', 'downloadProgress']);

export const notificationsSelector = R.path(['applets', 'notifications']);

// Flatten the applet activities into a single list, attaching some extra info
// to each activity
export const activitiesSelector = createSelector(
  appletsSelector,
  responsesGroupedByActivitySelector,
  (applets, responses) => applets.reduce((acc, applet) => {
    // Add applet id and applet shortname to each activity
    const now = Date.now();
    const dayMS = 24 * 60 * 60 * 1000;
    
    const extraInfoActivities = applet.activities.map((act) => {
      // const { last, next } = getNextAndLastTimes(act, now);
      return {
        ...act,
        appletId: applet.schema,
        appletShortName: applet.name,
        appletName: applet.name,
        lastScheduledTimestamp: now - dayMS,
        lastResponseTimestamp: now - dayMS + (dayMS / 2),
        nextScheduledTimestamp: now + dayMS,
      };
    });

    return [
      ...acc,
      ...extraInfoActivities,
    ];
  }, []),
);
