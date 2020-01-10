import * as R from 'ramda';
import { createSelector } from 'reselect';
import {
  appletsSelector,
  activitiesSelector,
} from '../applets/applets.selectors';

export const apiHostSelector = R.path(['app', 'apiHost']);

export const skinSelector = R.path(['app', 'skin']);

export const currentActivityIdSelector = R.path(['app', 'currentActivity']);

export const mobileDataAllowedSelector = R.path(['app', 'mobileDataAllowed']);

export const currentAppletIdSelector = R.path(['app', 'currentApplet']);

export const currentAppletSelector = createSelector(
  R.path(['app', 'currentApplet']),
  appletsSelector,
  // TODO: this could return undefined. So do we catch it here, or later on?
  (currentAppletId, applets) => {
    if (currentAppletId !== 'all') {
      return applets.find(applet => applet.id === currentAppletId) || null;
    }
    return applets.reduce((ele1, ele2) => {
      const merge = {};
      Object.keys(ele1).forEach((key) => {
        if (Array.isArray(ele1[key])) {
          merge[key] = [...ele1[key], ...ele2[key]];
        } else {
          merge[key] = ele1[key];
        }
      });
      return merge;
    });
  },
);

export const currentActivitySelector = createSelector(
  currentActivityIdSelector,
  activitiesSelector,
  (currentActivityId, activities) => activities.find(activity => activity.id === currentActivityId),
);
