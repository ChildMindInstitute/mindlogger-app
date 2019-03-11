import { createSelector } from 'reselect';
import * as R from 'ramda';
import { getLastResponseTime, getLastScheduledTime, getNextScheduledTime } from '../../services/time';
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
    const extraInfoActivities = applet.activities.map(act => ({
      ...act,
      appletId: applet._id,
      appletShortName: applet.meta.shortName,
      appletName: applet.name,
      lastScheduledTimestamp: getLastScheduledTime(act),
      lastResponseTimestamp: getLastResponseTime(act, responses),
      nextScheduledTimestamp: getNextScheduledTime(act),
    }));

    return [
      ...acc,
      ...extraInfoActivities,
    ];
  }, []),
);
