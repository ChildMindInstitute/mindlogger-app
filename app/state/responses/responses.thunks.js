import * as R from 'ramda';
import { Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import * as RNLocalize from 'react-native-localize';
import { getSchedule } from '../../services/network';
import { downloadAllResponses, uploadResponseQueue } from '../../services/api';
import { cleanFiles } from '../../services/file';
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
  setSchedule, replaceAppletResponses,
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
import {
  currentActivityIdSelector,
  currentAppletSelector,
} from '../app/app.selectors';
import {
  getNextPos,
  getLastPos,
} from '../../services/activityNavigation';

export const startFreshResponse = activity => (dispatch, getState) => {
  const state = getState();
  const { user } = state;
  const subjectId = R.path(['info', '_id'], user);
  const timeStarted = Date.now();
  const applet = currentAppletSelector(state);

  // There is no response in progress, so start a new one

  dispatch(createResponseInProgress(applet.id, activity, subjectId, timeStarted));
  dispatch(setCurrentScreen(applet.id, activity.id, 0));
  dispatch(setCurrentActivity(activity.id));
  Actions.push('take_act');
};

export const startResponse = activity => (dispatch, getState) => {
  const state = getState();
  const { responses, user } = state;
  const subjectId = R.path(['info', '_id'], user);
  const timeStarted = Date.now();
  const currentScreen = currentScreenSelector(getState());
  const applet = currentAppletSelector(state);

  if (typeof responses.inProgress[applet.id + activity.id] === 'undefined') {
    // There is no response in progress, so start a new one
    dispatch(createResponseInProgress(applet.id, activity, subjectId, timeStarted));
    dispatch(setCurrentScreen(applet.id, activity.id, 0));
    dispatch(setCurrentActivity(activity.id));
    Actions.push('take_act');
  } else {
    Alert.alert(
      'Resume activity',
      'Would you like to resume this activity in progress or restart?',
      [
        {
          text: 'Restart',
          onPress: () => {
            const itemResponses = R.pathOr([], ['inProgress', applet.id + activity.id, 'responses'], responses);
            cleanFiles(itemResponses);
            dispatch(createResponseInProgress(applet.id, activity, subjectId, timeStarted));
            dispatch(setCurrentScreen(applet.id, activity.id, 0));
            dispatch(setCurrentActivity(activity.id));
            Actions.push('take_act');
          },
        },
        {
          text: 'Resume',
          onPress: () => {
            dispatch(setCurrentScreen(applet.id, activity.id, currentScreen));
            dispatch(setCurrentActivity(activity.id));
            Actions.push('take_act');
          },
        },
      ],
      { cancelable: false },
    );
  }
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

  const timezone = RNLocalize.getTimeZone();
  getSchedule(authToken, timezone)
    .then((schedule) => {
      dispatch(setSchedule(schedule));
    });
};

export const downloadAppletResponses = applet => (dispatch, getState) => {
  const state = getState();
  const authToken = authTokenSelector(state);

  downloadAllResponses(authToken, [applet], (downloaded, total) => {
    dispatch(setResponsesDownloadProgress(downloaded, total));
  }).then((responses) => {
    if (loggedInSelector(getState())) {
      dispatch(replaceAppletResponses(responses));
    }
  });

  const timezone = RNLocalize.getTimeZone();
  getSchedule(authToken, timezone)
    .then((schedule) => {
      dispatch(setSchedule(schedule));
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
  const applet = currentAppletSelector(state);
  const inProgressResponse = currentResponsesSelector(state);
  const preparedResponse = prepareResponseForUpload(inProgressResponse);
  dispatch(addToUploadQueue(preparedResponse));
  setTimeout(() => {
    // Allow some time to navigate back to ActivityList
    dispatch(removeResponseInProgress(applet.id + inProgressResponse.activity.id));
  }, 300);
  dispatch(startUploadQueue());
};

export const nextScreen = () => (dispatch, getState) => {
  const state = getState();
  const applet = currentAppletSelector(state);
  const screenIndex = currentScreenSelector(state);
  const visibilityArray = itemVisiblitySelector(state);
  const next = getNextPos(screenIndex, visibilityArray);
  const activityId = currentActivityIdSelector(state);

  if (next === -1) {
    dispatch(completeResponse());
    Actions.push('activity_thanks');
  } else {
    dispatch(setCurrentScreen(applet.id, activityId, next));
  }
};

export const prevScreen = () => (dispatch, getState) => {
  const state = getState();
  const applet = currentAppletSelector(state);
  const screenIndex = currentScreenSelector(state);
  const visibilityArray = itemVisiblitySelector(state);
  const prev = getLastPos(screenIndex, visibilityArray);
  const activityId = currentActivityIdSelector(state);

  if (prev === -1) {
    Actions.pop();
  } else {
    dispatch(setCurrentScreen(applet.id, activityId, prev));
  }
};
