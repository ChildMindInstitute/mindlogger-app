import APPLET_CONSTANTS from './applets.constants';

export const clearApplets = () => ({
  type: APPLET_CONSTANTS.CLEAR,
});

export const replaceApplets = applets => ({
  type: APPLET_CONSTANTS.REPLACE_APPLETS,
  payload: applets,
});

export const setDownloadingApplets = isDownloading => ({
  type: APPLET_CONSTANTS.SET_DOWNLOADING_APPLETS,
  payload: isDownloading,
});

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

export const getOpenGroups = groups => ({
  type: APPLET_CONSTANTS.GET_OPEN_GROUPS,
  payload: groups,
});
