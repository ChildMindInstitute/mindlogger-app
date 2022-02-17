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

export const setTrailsTimerId = timerId => ({
  type: APP_ACTIONS.SET_TRAILS_TIMER_ID,
  payload: timerId,
})

export const setTutorialStatus = status => ({
  type: APP_ACTIONS.SET_TUTORIAL_STATUS,
  payload: status,
});

export const setTutorialIndex = status => ({
  type: APP_ACTIONS.SET_TUTORIAL_INDEX,
  payload: status,
});

export const setConnection = status => ({
  type: APP_ACTIONS.SET_CONNECTION,
  payload: status,
});

export const setCurrentActivity = activityId => ({
  type: APP_ACTIONS.SET_CURRENT_ACTIVITY,
  payload: activityId,
});

export const setCurrentEvent = eventId => ({
  type: APP_ACTIONS.SET_CURRENT_EVENT,
  payload: eventId,
});

export const setAppletSelectionDisabled = status => ({
  type: APP_ACTIONS.SET_APPLET_SELECTION_DISABLED,
  payload: status,
});

export const setActivitySelectionDisabled = status => ({
  type: APP_ACTIONS.SET_ACTIVITY_SELECTION_DISABLED,
  payload: status,
});

export const setActivityEndTime = status => ({
  type: APP_ACTIONS.SET_ACTIVITY_END_TIME,
  payload: status,
});

export const setClosedEvents = (payload) => ({
  type: APP_ACTIONS.SET_CLOSED_EVENT,
  payload
});

export const setActivityStartTime = status => ({
  type: APP_ACTIONS.SET_ACTIVITY_START_TIME,
  payload: status,
});

export const clearActivityStartTime = status => ({
  type: APP_ACTIONS.CLEAR_ACTIVITY_START_TIME,
  payload: status,
});

export const setAppStatus = appStatus => ({
  type: APP_ACTIONS.SET_APP_STATUS,
  payload: appStatus,
});

export const setLastActiveTime = time => ({
  type: APP_ACTIONS.SET_LAST_ACTIVE_TIME,
  payload: time,
})

export const toggleMobileDataAllowed = () => ({
  type: APP_ACTIONS.TOGGLE_MOBILE_DATA_ALLOWED,
});

export const setAppLanguage = () => ({
  type: APP_ACTIONS.SET_APP_LANGUAGE,
});

export const setLanguage = language => ({
  type: APP_ACTIONS.SET_APP_LANGUAGE,
  payload: language,
});

export const setTCPConnectionHistory = (history) => ({
  type: APP_ACTIONS.SET_TCP_CONNECTION_HISTORY,
  payload: history
});
