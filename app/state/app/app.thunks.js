import { Platform } from 'react-native';
import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
// import PushNotification from 'react-native-push-notification';
import * as firebase from 'react-native-firebase';
import { Toast } from 'native-base';
import EncryptedStorage from 'react-native-encrypted-storage'

import { clearApplets } from '../applets/applets.actions';
import { downloadApplets, downloadTargetApplet } from '../applets/applets.thunks';
import { clearResponses, setUploadIsInProgress } from '../responses/responses.actions';
import { deleteAndClearMedia } from '../media/media.thunks';
import { startUploadQueue } from '../responses/responses.thunks';
import { clearStorage } from "../../services/storage";
import { clearUser } from '../user/user.actions';
import { signOut, deleteUserAccount, postAppletBadge } from '../../services/network';
import { uploadQueueSelector, inProgressSelector } from '../responses/responses.selectors';
import { cleanFiles } from '../../services/file';
import { authTokenSelector, userInfoSelector } from '../user/user.selectors';
import { clearActivities } from '../activities/activities.actions';
import { UserInfoStorage } from '../../features/system'
import { NotificationManager } from '../../features/notifications';
import { canSupportNotifications } from '../../utils/constants'

const userInfoStorage = UserInfoStorage(EncryptedStorage);

export const showToast = toast => () => {
  Toast.show(toast);
};

export const sync = (onAppletsDownloaded = null, keys = null) => (dispatch, getState) => {
  const state = getState();
  if (state.user.auth !== null) {
    return dispatch(downloadApplets(onAppletsDownloaded, keys));
  }

  return Promise.resolve();
};

export const syncUploadQueue = () => (dispatch, getState) => {
  const state = getState();
  if (state.user.auth !== null) {
    dispatch(setUploadIsInProgress(true));
    dispatch(startUploadQueue()).finally(() => {
      dispatch(setUploadIsInProgress(false));
    });
  }
};

export const syncTargetApplet = (appletId, cb) => (dispatch, getState) => {
  const state = getState();
  if (state.user.auth !== null) {
    dispatch(downloadTargetApplet(appletId, cb));
  }
};

const doLogout = (dispatch, getState) => {
  // Actions.push('login'); // Should use `replace` instead of `push`
  const state = getState();
  const uploadQueue = uploadQueueSelector(state);
  const inProgress = inProgressSelector(state);

  // Delete files waiting to be uploaded
  uploadQueue.forEach((queuedUpload) => {
    const responses = R.pathOr([], ['payload', 'responses'], queuedUpload);
    cleanFiles(responses);
  });

  // Delete files for activities in progress
  Object.keys(inProgress).forEach((key) => {
    const responses = R.pathOr([], ['responses'], inProgress[key]);
    cleanFiles(responses);
  });

  if (state.user.auth !== null) {
    signOut(state.user.auth.token);
  }

  dispatch(clearUser());
  dispatch(clearApplets());
  dispatch(clearResponses());
  dispatch(deleteAndClearMedia());
  // dispatch(clearActivities());
  if (canSupportNotifications) {
    NotificationManager.clearScheduledNotifications();
  }
  userInfoStorage.clearUserEmail();
};

export const logout = () => (dispatch, getState) => {
  const state = getState();
  if (state.user?.auth?.token) {
    postAppletBadge(state.user.auth.token, 0);
  }
  const uploadQueue = uploadQueueSelector(state);

  clearStorage()
    .then(() => {
      if (uploadQueue.length > 0) {
        Actions.push('logout_warning', {
          onCancel: () => {
            Actions.pop();
          },
          onLogout: () => {
            Actions.push('login');
            doLogout(dispatch, getState);
          },
        });
      } else {
        doLogout(dispatch, getState);
      }
    });
};

export const removeAccount = () => (dispatch, getState) => {
  const state = getState();
  const authToken = authTokenSelector(state);
  const user = userInfoSelector(state);

  deleteUserAccount(authToken, user._id).then(() => {
    dispatch(clearUser());
    dispatch(clearApplets());
    dispatch(clearResponses());
    dispatch(deleteAndClearMedia());
    // PushNotification.cancelAllLocalNotifications();
    if (canSupportNotifications) {
      firebase.notifications().cancelAllNotifications();
    }
    Actions.push('login'); // Set screen back to login
  });
};
