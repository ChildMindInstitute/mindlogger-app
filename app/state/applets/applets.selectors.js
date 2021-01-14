import { createSelector } from 'reselect';
import * as R from 'ramda';
import { responseScheduleSelector } from '../responses/responses.selectors';
import { parseAppletActivities } from '../../models/json-ld';

// Attach some info to each activity
export const appletsSelector = createSelector(
  R.path(['applets', 'applets']),
  responseScheduleSelector,
  (applets, responseSchedule) => applets.map((applet) => parseAppletActivities(applet, responseSchedule)),
);

export const isDownloadingAppletsSelector = R.path(['applets', 'isDownloadingApplets']);

export const isDownloadingTargetAppletSelector = R.path(['applets', 'isDownloadingTargetApplet']);

export const isReminderSetSelector = R.path(['applets', 'isReminderSet']);

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
