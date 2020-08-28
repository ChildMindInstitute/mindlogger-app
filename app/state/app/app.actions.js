import APP_ACTIONS from './app.constants';

export const setApiHost = hostUrl => ({
  type: APP_ACTIONS.SET_API_HOST,
  payload: hostUrl.trim(),
});

export const resetApiHost = () => ({
  type: APP_ACTIONS.RESET_API_HOST,
});

export const setSkin = newSkin => ({
  type: APP_ACTIONS.SET_SKIN,
  payload: newSkin,
});

export const setUpdatedTime = updatedTime => ({
  type: APP_ACTIONS.SET_UPDATED_TIME,
  payload: updatedTime,
});

export const setCurrentApplet = appletId => ({
  type: APP_ACTIONS.SET_CURRENT_APPLET,
  payload: appletId,
});

export const setCurrentActivity = activityId => ({
  type: APP_ACTIONS.SET_CURRENT_ACTIVITY,
  payload: activityId,
});

export const setAppletSelectionDisabled = status => ({
  type: APP_ACTIONS.SET_APPLET_SELECTION_DISABLED,
  payload: status,
});

export const setActivitySelectionDisabled = status => ({
  type: APP_ACTIONS.SET_ACTIVITY_SELECTION_DISABLED,
  payload: status,
});

export const setAppStatus = appStatus => ({
  type: APP_ACTIONS.SET_APP_STATUS,
  payload: appStatus,
});

export const toggleMobileDataAllowed = () => ({
  type: APP_ACTIONS.TOGGLE_MOBILE_DATA_ALLOWED,
});
