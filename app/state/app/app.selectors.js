import * as R from 'ramda';
import { createSelector } from 'reselect';
import { activitiesSelector, appletsSelector } from '../applets/applets.selectors';

export const apiHostSelector = R.path(['app', 'apiHost']);

export const skinSelector = R.path(['app', 'skin']);

export const startedTimesSelector = R.path(['app', 'startedTimes']);

export const finishedEventsSelector = R.path(['app', 'finishedEvents']);

export const connectionSelector = R.path(['app', 'isConnected']);

export const appStatusSelector = R.path(['app', 'appStatus']);

export const currentActivityIdSelector = R.path(['app', 'currentActivity']);

export const mobileDataAllowedSelector = R.path(['app', 'mobileDataAllowed']);
export const languageSelector = R.path(['app', 'appLanguage']);

export const currentAppletSelector = createSelector(
  R.path(['app', 'currentApplet']),
  appletsSelector,
  // TODO: this could return undefined. So do we catch it here, or later on?
  (currentAppletId, applets) => applets.find((applet) => {
    if (applet.id === currentAppletId) {
      return true;
    }
  }) || null,
);

export const newAppletSelector = createSelector(
  R.path(['app', 'currentApplet']),
  R.path(['applets', 'applets']),
  // TODO: this could return undefined. So do we catch it here, or later on?
  (currentAppletId, newApplets) => newApplets.find((applet) => {
    return applet.id === currentAppletId;
  }) || null,
);

export const currentActivitySelector = createSelector(
  currentActivityIdSelector,
  activitiesSelector,
  (currentActivityId, activities) => activities.find(activity => activity.id === currentActivityId),
);

export const currentEventSelector = R.path(['app', 'currentEvent']);
export const appletSelectionDisabledSelector = R.path(['app', 'appletSelectionDisabled']);
export const activitySelectionDisabledSelector = R.path(['app', 'activitySelectionDisabled']);
