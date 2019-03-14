import { downloadAllApplets } from '../../services/api';
import { scheduleNotifications } from '../../services/pushNotifications';
import { downloadResponses } from '../responses/responses.actions';
import { showToast } from '../app/app.actions';
import APPLET_CONSTANTS from './applets.constants';
import { activitiesSelector, notificationsSelector } from './applets.selectors';
import { authSelector, userInfoSelector } from '../user/user.selectors';

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

export const setAppletDownloadProgress = (downloaded, total) => ({
  type: APPLET_CONSTANTS.SET_APPLET_DOWNLOAD_PROGRESS,
  payload: {
    downloaded,
    total,
  },
});

export const setNotifications = notifications => ({
  type: APPLET_CONSTANTS.SET_NOTIFICATIONS,
  payload: notifications,
});

export const scheduleAndSetNotifications = () => (dispatch, getState) => {
  const state = getState();
  const activities = activitiesSelector(state);
  const notifications = notificationsSelector(state);
  const updatedNotifications = scheduleNotifications(activities, notifications, true);
  dispatch(setNotifications(updatedNotifications));
};

export const downloadApplets = () => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  const userInfo = userInfoSelector(state);
  dispatch(setAppletDownloadProgress(0, 0));
  dispatch(setDownloadingApplets(true));
  downloadAllApplets(auth.token, userInfo._id, (downloaded, total) => {
    dispatch(setAppletDownloadProgress(downloaded, total));
  }).then((applets) => {
    dispatch(replaceApplets(applets));
    dispatch(downloadResponses(applets));
  }).finally(() => {
    dispatch(setDownloadingApplets(false));
    dispatch(showToast({
      text: 'Download complete',
      position: 'bottom',
      duration: 2000,
    }));
  });
};
