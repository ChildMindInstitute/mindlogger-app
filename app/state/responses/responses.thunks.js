import * as R from 'ramda';
import { downloadAllResponses, uploadResponseQueue } from '../../services/api';
import { prepareResponseForUpload } from '../../models/response';
import { scheduleAndSetNotifications } from '../applets/applets.thunks';
import { appletsSelector } from '../applets/applets.selectors';
import {
  userInfoSelector,
  authTokenSelector,
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
  const { responses, user } = getState();
  const subjectId = R.path(['info', '_id'], user);
  const timeStarted = Date.now();

  if (typeof responses.inProgress[activity.id] === 'undefined') {
    // There is no response in progress, so start a new one
    dispatch(createResponseInProgress(activity, subjectId, timeStarted));
  }

  dispatch(setCurrentActivity(activity.id));
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

export const completeResponse = inProgressResponse => (dispatch) => {
  const preparedResponse = prepareResponseForUpload(inProgressResponse);
  console.log('preparedResponse', preparedResponse);
  // dispatch(addToUploadQueue(preparedResponse));
  // setTimeout(() => {
  //   // Allow some time to navigate back to ActivityList
  //   dispatch(removeResponseInProgress(inProgressResponse.activity.id));
  // }, 300);
  // dispatch(startUploadQueue());
};
