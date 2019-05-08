import * as R from 'ramda';
import { createSelector } from 'reselect';
import { appletsSelector, activitiesSelector } from '../applets/applets.selectors';

export const apiHostSelector = R.path(['app', 'apiHost']);

export const skinSelector = R.path(['app', 'skin']);

export const currentActivityIdSelector = R.path(['app', 'currentActivity']);

export const currentAppletSelector = createSelector(
  R.path(['app', 'currentApplet']),
  appletsSelector,
  (currentAppletId, applets) => applets.find(applet => applet.id === currentAppletId),
);

export const currentActivitySelector = createSelector(
  currentActivityIdSelector,
  activitiesSelector,
  (currentActivityId, activities) => activities.find(activity => activity.id === currentActivityId),
);
