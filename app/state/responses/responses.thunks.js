import * as R from 'ramda';
import { Actions } from 'react-native-router-flux';
import { downloadAllResponses, uploadResponseQueue } from '../../services/api';
import { prepareResponseForUpload } from '../../models/response';
import { scheduleAndSetNotifications } from '../applets/applets.thunks';
import { appletsSelector } from '../applets/applets.selectors';
import {
  authTokenSelector,
  loggedInSelector,
} from '../user/user.selectors';
import {
  createResponseInProgress,
  setDownloadingResponses,
  replaceResponses,
  setResponsesDownloadProgress,
  removeResponseInProgress,
  addToUploadQueue,
  shiftUploadQueue,
  setCurrentScreen,
  setAnswer,
} from './responses.actions';
import {
  setCurrentActivity,
} from '../app/app.actions';
import {
  uploadQueueSelector,
  currentResponsesSelector,
  currentScreenSelector,
  itemVisiblitySelector,
} from './responses.selectors';
import { currentActivityIdSelector } from '../app/app.selectors';
import {
  getNextPos,
  getLastPos,
} from '../../services/activityNavigation';

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
  const applets = appletsSelector(state);
  dispatch(setDownloadingResponses(true));
  downloadAllResponses(authToken, applets, (downloaded, total) => {
    dispatch(setResponsesDownloadProgress(downloaded, total));
  }).then((responses) => {
    if (loggedInSelector(getState())) {
      dispatch(replaceResponses(responses));
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

export const completeResponse = () => (dispatch, getState) => {
  const state = getState();
  const inProgressResponse = currentResponsesSelector(state);
  const preparedResponse = prepareResponseForUpload(inProgressResponse);
  dispatch(addToUploadQueue(preparedResponse));
  setTimeout(() => {
    // Allow some time to navigate back to ActivityList
    dispatch(removeResponseInProgress(inProgressResponse.activity.id));
  }, 300);
  dispatch(startUploadQueue());
};

export const nextScreen = () => (dispatch, getState) => {
  const state = getState();
  const screenIndex = currentScreenSelector(state);
  const visibilityArray = itemVisiblitySelector(state);
  const next = getNextPos(screenIndex, visibilityArray);
  const activityId = currentActivityIdSelector(state);

  if (next === -1) {
    dispatch(completeResponse());
    Actions.push('activity_thanks');
  } else {
    dispatch(setCurrentScreen(activityId, next));
  }
};

export const prevScreen = () => (dispatch, getState) => {
  const state = getState();
  const screenIndex = currentScreenSelector(state);
  const visibilityArray = itemVisiblitySelector(state);
  const prev = getLastPos(screenIndex, visibilityArray);
  const activityId = currentActivityIdSelector(state);

  if (prev === -1) {
    Actions.pop();
  } else {
    dispatch(setCurrentScreen(activityId, prev));
  }
};
