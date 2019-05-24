import RESPONSES_CONSTANTS from './responses.constants';

export const clearResponses = () => ({
  type: RESPONSES_CONSTANTS.CLEAR,
});

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

export const removeResponseInProgress = activityId => ({
  type: RESPONSES_CONSTANTS.REMOVE_RESPONSE_IN_PROGRESS,
  payload: activityId,
});

export const createResponseInProgress = (activity, subjectId, timeStarted) => ({
  type: RESPONSES_CONSTANTS.CREATE_RESPONSE_IN_PROGRESS,
  payload: {
    activity,
    subjectId,
    timeStarted,
  },
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

export const setCurrentScreen = (activityId, screenIndex) => ({
  type: RESPONSES_CONSTANTS.SET_CURRENT_SCREEN,
  payload: {
    activityId,
    screenIndex,
  },
});
