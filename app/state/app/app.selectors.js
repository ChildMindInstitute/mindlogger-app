import * as R from 'ramda';
import { createSelector } from 'reselect';
import { activitiesSelector, appletsSelector, allAppletsSelector } from '../applets/applets.selectors';

export const apiHostSelector = R.path(['app', 'apiHost']);

export const skinSelector = R.path(['app', 'skin']);

export const currentActivityIdSelector = R.path(['app', 'currentActivity']);

export const mobileDataAllowedSelector = R.path(['app', 'mobileDataAllowed']);

export const currentAppletSelector = createSelector(
  R.path(['app', 'currentApplet']),
  appletsSelector,
  // TODO: this could return undefined. So do we catch it here, or later on?
  (currentAppletId, applets) => applets.find((applet) => {
    return applet.id === currentAppletId;
  }) || null,
);

export const newAppletSelector = createSelector(
  R.path(['app', 'currentApplet']),
  allAppletsSelector,
  // TODO: this could return undefined. So do we catch it here, or later on?
  (currentAppletId, newApplets) => newApplets.find((applet) => {
    return applet.applet.id === currentAppletId;
  }) || null,
);

export const currentActivitySelector = createSelector(
  currentActivityIdSelector,
  activitiesSelector,
  (currentActivityId, activities) => activities.find(activity => activity.id === currentActivityId),
);
