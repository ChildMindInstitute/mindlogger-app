import * as R from 'ramda';
import { createSelector } from 'reselect';
import AllAppletsModel, { isAllAppletsModel } from '../../scenes/AppletTabs/AllAppletsModel';
import { appletsSelector, activitiesSelector } from '../applets/applets.selectors';

export const apiHostSelector = R.path(['app', 'apiHost']);

export const skinSelector = R.path(['app', 'skin']);

export const currentActivityIdSelector = R.path(['app', 'currentActivity']);

export const mobileDataAllowedSelector = R.path(['app', 'mobileDataAllowed']);

export const currentAppletSelector = createSelector(
  R.path(['app', 'currentApplet']),
  appletsSelector,
  // TODO: this could return undefined. So do we catch it here, or later on?
  (currentAppletId, applets) => {
    if (isAllAppletsModel(currentAppletId)) {
      return AllAppletsModel;
    }
    return applets.find(applet => applet.id === currentAppletId) || null;
  },
);

export const currentActivitySelector = createSelector(
  currentActivityIdSelector,
  activitiesSelector,
  (currentActivityId, activities) => activities.find(activity => activity.id === currentActivityId),
);
