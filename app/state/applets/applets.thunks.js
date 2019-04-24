// import { downloadAllApplets } from '../../services/api';
import { downloadAllApplets } from '../../services/mock-api';
import { scheduleNotifications } from '../../services/pushNotifications';
import { downloadResponses } from '../responses/responses.thunks';
import { showToast } from '../app/app.actions';
import { activitiesSelector } from './applets.selectors';
import { authSelector, userInfoSelector, loggedInSelector } from '../user/user.selectors';
import {
  setNotifications,
  setAppletDownloadProgress,
  setDownloadingApplets,
  replaceApplets,
} from './applets.actions';

export const scheduleAndSetNotifications = () => (dispatch, getState) => {
  const state = getState();
  const activities = activitiesSelector(state);
  // This call schedules the notifications and returns a list of scheduled notifications
  const updatedNotifications = scheduleNotifications(activities);
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
    if (loggedInSelector(getState())) {
      dispatch(replaceApplets(applets));
      dispatch(downloadResponses(applets));
      dispatch(showToast({
        text: 'Download complete',
        position: 'bottom',
        duration: 2000,
      }));
    }
  }).finally(() => {
    dispatch(setDownloadingApplets(false));
  });
};
