import { downloadAllResponses, uploadResponseQueue } from '../../services/api';
import { prepareResponseForUpload } from '../../services/transform';
import { scheduleAndSetNotifications } from '../applets/applets.thunks';
import { appletsSelector } from '../applets/applets.selectors';
import {
  userInfoSelector,
  authTokenSelector,
  responseCollectionIdSelector,
  loggedInSelector,
} from '../user/user.selectors';
import {
  createResponseInProgress,
  setCurrentActivity,
  setDownloadingResponses,
  replaceResponses,
  setResponsesDownloadProgress,
  removeResponseInProgress,
  addToUploadQueue,
  shiftUploadQueue,
} from './responses.actions';
import { uploadQueueSelector } from './responses.selectors';

export const startResponse = activity => (dispatch, getState) => {
  const { responses } = getState();

  if (typeof responses.inProgress[activity._id] === 'undefined') {
    // There is no response in progress, so start a new one
    dispatch(createResponseInProgress(activity));
  }

  dispatch(setCurrentActivity(activity._id));
};

export const downloadResponses = () => (dispatch, getState) => {
  const state = getState();
  const authToken = authTokenSelector(state);
  const userInfo = userInfoSelector(state);
  const applets = appletsSelector(state);
  dispatch(setDownloadingResponses(true));
  downloadAllResponses(authToken, userInfo._id, applets, (downloaded, total) => {
    dispatch(setResponsesDownloadProgress(downloaded, total));
  }).then((applets) => {
    if (loggedInSelector(getState())) {
      dispatch(replaceResponses(applets));
      dispatch(scheduleAndSetNotifications());
    }
  }).finally(() => {
    dispatch(setDownloadingResponses(false));
  });
};

export const startUploadQueue = () => (dispatch, getState) => {
  const state = getState();
  const uploadQueue = uploadQueueSelector(state);
  const authToken = authTokenSelector(state);
  uploadResponseQueue(authToken, uploadQueue, () => {
    // Progress - a response was uploaded
    dispatch(shiftUploadQueue());
  }).finally(() => {
    dispatch(downloadResponses());
  });
};

export const completeResponse = (activity, answers) => (dispatch, getState) => {
  const state = getState();
  const responseCollectionId = responseCollectionIdSelector(state);
  const preparedResponse = prepareResponseForUpload(activity, answers, responseCollectionId);
  dispatch(addToUploadQueue(preparedResponse));
  setTimeout(() => {
    // Allow some time to navigate back to ActivityList
    dispatch(removeResponseInProgress(activity._id));
  }, 300);
  dispatch(startUploadQueue());
};
