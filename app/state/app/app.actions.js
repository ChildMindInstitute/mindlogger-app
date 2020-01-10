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

export const setCurrentApplet = appletId => ({
  type: APP_ACTIONS.SET_CURRENT_APPLET,
  payload: appletId,
});

export const setCurrentActivity = activityId => ({
  type: APP_ACTIONS.SET_CURRENT_ACTIVITY,
  payload: activityId,
});

export const toggleMobileDataAllowed = () => ({
  type: APP_ACTIONS.TOGGLE_MOBILE_DATA_ALLOWED,
});
