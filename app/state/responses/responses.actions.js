import { downloadAllResponses, uploadResponseQueue } from '../../services/api';
import { prepareResponseForUpload } from '../../services/transform';
import RESPONSES_CONSTANTS from './responses.constants';

export const replaceResponses = responses => ({
  type: RESPONSES_CONSTANTS.REPLACE_RESPONSES,
  payload: responses,
});

export const setDownloadingResponses = isDownloading => ({
  type: RESPONSES_CONSTANTS.SET_DOWNLOADING_RESPONSES,
  payload: isDownloading,
});

export const setResponsesDownloadProgress = (downloaded, total) => ({
  type: RESPONSES_CONSTANTS.SET_RESPONSES_DOWNLOAD_PROGRESS,
  payload: {
    downloaded,
    total,
  },
});

export const setCurrentActivity = activityId => ({
  type: RESPONSES_CONSTANTS.SET_CURRENT_ACTIVITY,
  payload: activityId,
});

export const removeResponseInProgress = activityId => ({
  type: RESPONSES_CONSTANTS.REMOVE_RESPONSE_IN_PROGRESS,
  payload: activityId,
});

export const createResponseInProgress = activity => ({
  type: RESPONSES_CONSTANTS.CREATE_RESPONSE_IN_PROGRESS,
  payload: activity,
});

export const setAnswer = (activityId, screenIndex, answer) => ({
  type: RESPONSES_CONSTANTS.SET_ANSWER,
  payload: {
    activityId,
    screenIndex,
    answer,
  },
});

export const setAnswers = (activityId, response) => ({
  type: RESPONSES_CONSTANTS.SET_ANSWERS,
  payload: {
    activityId,
    response,
  },
});

export const addToUploadQueue = response => ({
  type: RESPONSES_CONSTANTS.ADD_TO_UPLOAD_QUEUE,
  payload: response,
});

export const shiftUploadQueue = () => ({
  type: RESPONSES_CONSTANTS.SHIFT_UPLOAD_QUEUE,
});

export const startResponse = activity => (dispatch, getState) => {
  const { responses } = getState();

  if (typeof responses.inProgress[activity._id] === 'undefined') {
    // There is no response in progress, so start a new one
    dispatch(createResponseInProgress(activity));
  }

  dispatch(setCurrentActivity(activity._id));
};

export const downloadResponses = () => (dispatch, getState) => {
  const { core, applets } = getState();
  const { auth, self } = core;
  dispatch(setDownloadingResponses(true));
  downloadAllResponses(auth.token, self._id, applets.applets, (downloaded, total) => {
    dispatch(setResponsesDownloadProgress(downloaded, total));
  }).then((applets) => {
    dispatch(replaceResponses(applets));
  }).finally(() => {
    dispatch(setDownloadingResponses(false));
  });
};

export const startUploadQueue = () => (dispatch, getState) => {
  const { responses, core } = getState();
  uploadResponseQueue(core.auth.token, responses.uploadQueue, () => {
    // Progress - a response was uploaded
    dispatch(shiftUploadQueue());
  }).finally(() => {
    dispatch(downloadResponses());
  });
};

export const completeResponse = (activity, answers) => (dispatch, getState) => {
  const { user } = getState();
  const preparedResponse = prepareResponseForUpload(activity, answers, user.responseCollectionId);
  dispatch(addToUploadQueue(preparedResponse));
  setTimeout(() => {
    // Allow some time to navigate back to ActivityList
    dispatch(removeResponseInProgress(activity._id));
  }, 300);
  dispatch(startUploadQueue());
};
