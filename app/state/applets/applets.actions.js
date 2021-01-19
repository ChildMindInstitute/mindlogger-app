import APPLET_CONSTANTS from './applets.constants';

export const clearApplets = () => ({
  type: APPLET_CONSTANTS.CLEAR,
});

export const replaceApplets = applets => ({
  type: APPLET_CONSTANTS.REPLACE_APPLETS,
  payload: applets,
});

export const setNotificationReminder = applets => ({
  type: APPLET_CONSTANTS.SET_REMINDER,
  payload: applets,
});

export const clearNotificationReminder = applets => ({
  type: APPLET_CONSTANTS.CLEAR_REMINDER,
  payload: applets,
});

export const prepareResponseKeys = (appletId, keys) => ({
  type: APPLET_CONSTANTS.SET_ENCRYPTION_KEY,
  payload: { appletId, keys }
})

export const replaceTargetApplet = applet => ({
  type: APPLET_CONSTANTS.REPLACE_TARGET_APPLET,
  payload: applet,
});

export const setScheduleUpdated = scheduleUpdated => ({
  type: APPLET_CONSTANTS.SET_SCHEDULE_UPDATED,
  payload: scheduleUpdated,
});

export const replaceTargetAppletSchedule = (appletId, schedule) => ({
  type: APPLET_CONSTANTS.REPLACE_TARGET_APPLETSCHEDULE,
  payload: { appletId, schedule },
});

export const setDownloadingApplets = isDownloading => ({
  type: APPLET_CONSTANTS.SET_DOWNLOADING_APPLETS,
  payload: isDownloading,
});

export const setDownloadingTargetApplet = isDownloading => ({
  type: APPLET_CONSTANTS.SET_DOWNLOADING_TARGET_APPLET,
  payload: isDownloading,
});

/* deprecated */
export const setNotifications = notifications => ({
  type: APPLET_CONSTANTS.SET_NOTIFICATIONS,
  payload: notifications,
});

export const setInvites = invites => ({
  type: APPLET_CONSTANTS.SET_INVITES,
  payload: invites,
});

export const setCurrentInvite = inviteId => ({
  type: APPLET_CONSTANTS.SET_CURRENT_INVITE,
  payload: inviteId,
});

export const saveAppletResponseData = (appletId, data) => ({
  type: APPLET_CONSTANTS.SAVE_APPLET_RESPONSE_DATA,
  payload: { appletId, data },
});
