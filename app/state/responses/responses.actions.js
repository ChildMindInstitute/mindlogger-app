import RESPONSES_CONSTANTS from './responses.constants';

export const clearResponses = () => ({
  type: RESPONSES_CONSTANTS.CLEAR,
});

export const setSelected = (isSelected = false) => ({
  type: RESPONSES_CONSTANTS.SET_SELECTED,
  payload: isSelected,
});

export const setSummaryScreen = (activity, isSummaryScreen = false) => ({
  type: RESPONSES_CONSTANTS.SET_SUMMARYSCREEN,
  payload: { activity, isSummaryScreen },
});

export const setSplashScreen = (activity, isSplashScreen = false) => ({
  type: RESPONSES_CONSTANTS.SET_SPLASHSCREEN,
  payload: { activity, isSplashScreen }
})

export const replaceResponses = responses => ({
  type: RESPONSES_CONSTANTS.REPLACE_RESPONSES,
  payload: responses,
});

export const replaceAppletResponses = responses => ({
  type: RESPONSES_CONSTANTS.REPLACE_APPLET_RESPONSES,
  payload: responses,
});

export const setActivityOpened = responses => ({
  type: RESPONSES_CONSTANTS.OPEN_ACTIVITY,
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

export const createResponseInProgress = (appletId, activity, subjectId, timeStarted) => ({
  type: RESPONSES_CONSTANTS.CREATE_RESPONSE_IN_PROGRESS,
  payload: {
    appletId,
    activity,
    subjectId,
    timeStarted,
  },
});

export const setAnswer = (activity, screenIndex, answer) => ({
  type: RESPONSES_CONSTANTS.SET_ANSWER,
  payload: {
    activity,
    screenIndex,
    answer,
  },
});

export const addToUploadQueue = response => ({
  type: RESPONSES_CONSTANTS.ADD_TO_UPLOAD_QUEUE,
  payload: response,
});

export const shiftUploadQueue = () => ({
  type: RESPONSES_CONSTANTS.SHIFT_UPLOAD_QUEUE,
});

export const setCurrentScreen = (activityId, screenIndex, startTime) => ({
  type: RESPONSES_CONSTANTS.SET_CURRENT_SCREEN,
  payload: {
    activityId,
    screenIndex,
    startTime
  },
});

export const setSchedule = schedule => ({
  type: RESPONSES_CONSTANTS.SET_SCHEDULE,
  payload: schedule,
});
