import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
import PushNotification from 'react-native-push-notification';
import { Toast } from 'native-base';
import { clearApplets } from '../applets/applets.actions';
import { downloadApplets } from '../applets/applets.thunks';
import { clearResponses } from '../responses/responses.actions';
import { deleteAndClearMedia } from '../media/media.thunks';
import { startUploadQueue } from '../responses/responses.thunks';
import { clearUser } from '../user/user.actions';
import { signOut } from '../../services/network';
import { uploadQueueSelector, inProgressSelector } from '../responses/responses.selectors';
import { cleanFiles } from '../../services/file';

export const showToast = toast => () => {
  Toast.show(toast);
};

export const sync = () => (dispatch, getState) => {
  const state = getState();
  if (state.user.auth !== null) {
    dispatch(downloadApplets());
    dispatch(startUploadQueue());
  }
};

const doLogout = (dispatch, getState) => {
  Actions.replace('login'); // Set screen back to login
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
  PushNotification.cancelAllLocalNotifications();
};

export const logout = () => (dispatch, getState) => {
  const state = getState();
  const uploadQueue = uploadQueueSelector(state);
  if (uploadQueue.length > 0) {
    Actions.push('logout_warning', {
      onCancel: () => { Actions.pop(); },
      onLogout: () => {
        Actions.pop();
        doLogout(dispatch, getState);
      },
    });
  } else {
    doLogout(dispatch, getState);
  }
};
