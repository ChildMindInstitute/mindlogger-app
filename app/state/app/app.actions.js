import { Toast } from 'native-base';
import { Actions } from 'react-native-router-flux';
import PushNotification from 'react-native-push-notification';
import { downloadApplets, clearApplets } from '../applets/applets.actions';
import { startUploadQueue, clearResponses } from '../responses/responses.actions';
import { clearUser } from '../user/user.actions';
import { signOut } from '../../services/network';
import { uploadQueueSelector } from '../responses/responses.selectors';
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
  uploadQueue.forEach((queuedUpload) => {
    cleanFiles(queuedUpload);
  });

  if (state.user.auth !== null) {
    signOut(state.user.auth.token);
  }

  dispatch(clearUser());
  dispatch(clearApplets());
  dispatch(clearResponses());
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
