import * as R from 'ramda';
import { createSelector } from 'reselect';
import { appletsSelector } from '../applets/applets.selectors';

export const apiHostSelector = R.path(['app', 'apiHost']);

export const currentAppletSelector = createSelector(
  R.path(['app', 'currentApplet']),
  appletsSelector,
  (currentAppletId, applets) => applets.find(applet => applet.id === currentAppletId),
);
