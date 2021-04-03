import * as R from "ramda";
import { Alert } from "react-native";
import { Actions } from "react-native-router-flux";
import * as RNLocalize from "react-native-localize";
import i18n from "i18next";
import { getSchedule, replaceResponseData, updateUserTokenBalance } from "../../services/network";
import { downloadAllResponses, downloadAppletResponse, uploadResponseQueue } from "../../services/api";
import { cleanFiles } from "../../services/file";
import {
  prepareResponseForUpload,
  getEncryptedData,
  getTokenUpdateInfo,
} from "../../models/response";
import { scheduleAndSetNotifications } from "../applets/applets.thunks";
import { storeData } from "../../services/asyncStorage";
import { appletsSelector } from "../applets/applets.selectors";
import {
  responsesSelector,
  uploadQueueSelector,
  currentResponsesSelector,
  currentAppletResponsesSelector,
  currentScreenSelector,
  itemVisiblitySelector,
  currentAppletTokenBalanceSelector,
} from "./responses.selectors";
import {
  authTokenSelector,
  loggedInSelector,
  userInfoSelector,
} from "../user/user.selectors";
import {
  createResponseInProgress,
  setDownloadingResponses,
  replaceResponses,
  setResponsesDownloadProgress,
  removeResponseInProgress,
  addToUploadQueue,
  shiftUploadQueue,
  setCurrentScreen,
  setSchedule,
  setSummaryScreen,
  replaceAppletResponses,
  setActivityOpened,
} from "./responses.actions";
import {
  setActivityStartTime,
  setCurrentActivity,
  clearActivityStartTime,
  setActivityEndTime,
} from "../app/app.actions";

import {
  currentEventSelector,
  currentAppletSelector,
  startedTimesSelector,
  currentActivitySelector,
} from "../app/app.selectors";
import { getNextPos, getLastPos } from "../../services/activityNavigation";

import { prepareResponseKeys, setActivityAccess } from "../applets/applets.actions";

import { getAESKey, getPublicKey } from "../../services/encryption";
import config from "../../config";

export const updateKeys = (applet, userInfo) => (dispatch) => {
  if (!applet.encryption) return;

  applet.AESKey = getAESKey(
    userInfo.privateKey,
    applet.encryption.appletPublicKey,
    applet.encryption.appletPrime,
    applet.encryption.base
  );

  applet.userPublicKey = Array.from(
    getPublicKey(
      userInfo.privateKey,
      applet.encryption.appletPrime,
      applet.encryption.base
    )
  );

  dispatch(
    prepareResponseKeys(applet.id, {
      AESKey: applet.AESKey,
      userPublicKey: applet.userPublicKey,
    })
  );
};

export const startFreshResponse = (activity) => (dispatch, getState) => {
  const state = getState();
  const { user } = state;
  const subjectId = R.path(["info", "_id"], user);
  const timeStarted = Date.now();
  const event = currentEventSelector(state);
  const applet = currentAppletSelector(state);

  // There is no response in progress, so start a new one

  dispatch(
    createResponseInProgress(applet.id, activity, subjectId, timeStarted)
  );
  dispatch(setCurrentScreen(event ? activity.id + event : activity.id, 0));
  dispatch(setCurrentActivity(activity.id));
  Actions.push("take_act");
};

export const startResponse = (activity) => (dispatch, getState) => {
  const state = getState();
  const { responses, user } = state;
  const startedTimes = startedTimesSelector(state);
  const subjectId = R.path(["info", "_id"], user);
  const timeStarted = Date.now();
  const currentScreen = currentScreenSelector(state);
  const applet = currentAppletSelector(state);
  const index = activity.event ? activity.id + activity.event.id : activity.id;
  const event = currentEventSelector(state);

  if (activity.isPrize === true) {
    const tokenBalance = currentAppletTokenBalanceSelector(state).cumulativeToken;
    const prizesActivity = R.assocPath(['items', 0, 'info', 'en'],
      `Balance: ${tokenBalance} Token${tokenBalance >= 2 ? 's' : ''}`,
      activity);
    dispatch(createResponseInProgress(applet.id, prizesActivity, subjectId, timeStarted));
    dispatch(setCurrentScreen(event ? activity.id + event : activity.id, 0));
    dispatch(setCurrentActivity(activity.id));
    Actions.push('take_act');
  } else if (typeof responses.inProgress[index] === "undefined") {
    // There is no response in progress, so start a new one
    if (activity.lastTimedActivity && startedTimes && !startedTimes[activity.id]) {
      dispatch(setActivityStartTime(activity.id));
    }
    dispatch(
      createResponseInProgress(applet.id, activity, subjectId, timeStarted)
    );
    dispatch(setCurrentScreen(event ? activity.id + event : activity.id, 0));
    dispatch(setCurrentActivity(activity.id));
    Actions.push("take_act");
  } else {
    Alert.alert(
      i18n.t("additional:resume_activity"),
      i18n.t("additional:activity_resume_restart"),
      [
        {
          text: i18n.t("additional:restart"),
          onPress: () => {
            const itemResponses = R.pathOr(
              [],
              ["inProgress", index, "responses"],
              responses
            );

            if ((activity.lastTimedActivity || activity.nextTimedActivity)
              && startedTimes
              && !startedTimes[activity.id]
            ) {
              dispatch(setActivityStartTime(activity.id));
            }

            cleanFiles(itemResponses);
            dispatch(setSummaryScreen(false));
            dispatch(setActivityOpened(true));
            dispatch(
              createResponseInProgress(
                applet.id,
                activity,
                subjectId,
                timeStarted
              )
            );
            dispatch(setCurrentScreen(event ? activity.id + event : activity.id, 0));
            dispatch(setCurrentActivity(activity.id));
            Actions.push("take_act");
          },
        },
        {
          text: i18n.t("additional:resume"),
          onPress: () => {
            if ((activity.lastTimedActivity || activity.nextTimedActivity)
              && startedTimes
              && !startedTimes[activity.id]
            ) {
              dispatch(setActivityStartTime(activity.id));
            }

            dispatch(setActivityOpened(true));
            dispatch(setCurrentScreen(event ? activity.id + event : activity.id, currentScreen || 0));
            dispatch(setCurrentActivity(activity.id));
            Actions.push("take_act");
          },
        },
      ],
      { cancelable: false }
    );
  }
};

export const downloadResponse = () => (dispatch, getState) => {
  const state = getState();
  const authToken = authTokenSelector(state);
  const userInfo = userInfoSelector(state);
  const applet = currentAppletSelector(state);

  dispatch(updateKeys(applet, userInfo));
  dispatch(setDownloadingResponses(true));

  downloadAppletResponse(authToken, applet)
    .then(async (responses) => {
      if (loggedInSelector(getState())) {
        await storeData('ml_responses', responses);
        dispatch(replaceResponses(responses));
      }
    })
    .finally(() => {
      dispatch(setDownloadingResponses(false));
    });

  const timezone = RNLocalize.getTimeZone();
  getSchedule(authToken, timezone).then((schedule) => {
    dispatch(setSchedule(schedule));
  });
}

export const downloadResponses = () => (dispatch, getState) => {
  const state = getState();
  const authToken = authTokenSelector(state);
  const applets = appletsSelector(state);
  const userInfo = userInfoSelector(state);

  for (const applet of applets) {
    if ((!applet.AESKey || !applet.userPublicKey) && config.encryptResponse) {
      dispatch(updateKeys(applet, userInfo));
    }
  }

  dispatch(setDownloadingResponses(true));
  downloadAllResponses(authToken, applets, (downloaded, total) => {
    dispatch(setResponsesDownloadProgress(downloaded, total));
  })
    .then(async (responses) => {
      if (loggedInSelector(getState())) {
        await storeData('ml_responses', responses);
        dispatch(replaceResponses(responses));
      }
    })
    .finally(() => {
      dispatch(setDownloadingResponses(false));
    });

  const timezone = RNLocalize.getTimeZone();
  getSchedule(authToken, timezone).then((schedule) => {
    dispatch(setSchedule(schedule));
  });
};

export const replaceReponses = (user) => (dispatch, getState) => {
  const state = getState();
  const applets = appletsSelector(state);
  const responses = responsesSelector(state);
  const authToken = authTokenSelector(state);

  const uploadData = [];
  for (const response of responses) {
    const dataSources = {};
    const tokenUpdates = {};

    const applet = applets.find((applet) => applet.id === response.appletId);

    if (Object.keys(response.dataSources).length || (response.tokens && response.tokens.tokenUpdates.length)) {
      dispatch(updateKeys(applet, user));
    } else {
      /** if there isn't anything to re-upload leave key as empty for speed */
      dispatch(
        prepareResponseKeys(applet.id, {
          AESKey: null,
          userPublicKey: null,
        })
      );

      continue;
    }

    for (const responseId in response.dataSources) {
      if (Object.keys(response).length) {
        dataSources[responseId] = getEncryptedData(
          response.dataSources[responseId],
          applet.AESKey
        );
      }
    }

    if (response.tokens && response.tokens.tokenUpdates) {
      for (let tokenUpdate of response.tokens.tokenUpdates) {
        tokenUpdates[tokenUpdate.id] = getEncryptedData(
          {
            value: tokenUpdate.value
          },
          applet.AESKey
        )
      }
    }

    uploadData.push({
      userPublicKey: applet.userPublicKey,
      appletId: applet.id.split("/").pop(),
      dataSources,
      tokenUpdates,
    });
  }

  return Promise.all(
    uploadData.map((data) =>
      replaceResponseData({
        authToken,
        ...data,
      })
    )
  );
};

export const downloadAppletResponses = (applet) => (dispatch, getState) => {
  const state = getState();
  const authToken = authTokenSelector(state);

  if ((!applet.AESKey || !applet.userPublicKey) && config.encryptResponse) {
    dispatch(updateKeys(applet, userInfoSelector(state)));
  }

  downloadAllResponses(authToken, [applet], (downloaded, total) => {
    dispatch(setResponsesDownloadProgress(downloaded, total));
  }).then((responses) => {
    if (loggedInSelector(getState())) {
      dispatch(replaceAppletResponses(responses));
    }
  });

  const timezone = RNLocalize.getTimeZone();
  getSchedule(authToken, timezone).then((schedule) => {
    dispatch(setSchedule(schedule));
  });
};

export const startUploadQueue = () => (dispatch, getState) => {
  const state = getState();
  const uploadQueue = uploadQueueSelector(state);
  const authToken = authTokenSelector(state);
  const applet = currentAppletSelector(state);

  uploadResponseQueue(authToken, uploadQueue, () => {
    // Progress - a response was uploaded
    dispatch(shiftUploadQueue());
  }).finally(() => {
    if (applet) {
      dispatch(downloadResponse());
    } else {
      dispatch(downloadResponses());
    }
  });
};

export const completeResponse = (isTimeout = false) => (dispatch, getState) => {
  const state = getState();
  const authToken = authTokenSelector(state);
  const applet = currentAppletSelector(state);
  const inProgressResponse = currentResponsesSelector(state);
  const activity = currentActivitySelector(state);

  if ((!applet.AESKey || !applet.userPublicKey) && config.encryptResponse) {
    dispatch(updateKeys(applet, userInfoSelector(state)));
  }

  const responseHistory = currentAppletResponsesSelector(state);

  if (activity.isPrize === true) {
    const selectedPrizeIndex = inProgressResponse["responses"][0];
    const version = inProgressResponse["activity"].appletSchemaVersion['en'];
    const selectedPrize = activity.items[0].valueConstraints.itemList[selectedPrizeIndex];

    const updates = getTokenUpdateInfo(
      -selectedPrize.price,
      responseHistory,
      applet,
    );

    updateUserTokenBalance(
      authToken,
      applet.id.split('/').pop(),
      updates.offset,
      updates.cumulative,
      version,
      updates.userPublicKey || null
    ).then(() => {
      dispatch(downloadResponses())
    })
  } else {
    const preparedResponse = prepareResponseForUpload(inProgressResponse, applet, responseHistory, isTimeout);

    dispatch(addToUploadQueue(preparedResponse));
    dispatch(startUploadQueue());
  }

  setTimeout(() => {
    const { activity } = inProgressResponse;
    // Allow some time to navigate back to ActivityList
    dispatch(
      removeResponseInProgress(activity.event ? activity.id + activity.event.id : activity.id)
    );
  }, 300);
};

export const nextScreen = () => (dispatch, getState) => {
  const state = getState();
  const applet = currentAppletSelector(state);
  const screenIndex = currentScreenSelector(state);
  const visibilityArray = itemVisiblitySelector(state);
  const next = getNextPos(screenIndex, visibilityArray);
  const activity = currentActivitySelector(state);
  const event = currentEventSelector(state);

  if (next === -1) {
    if (activity.nextAccess) {
      dispatch(setActivityAccess(applet.id + activity.id));
    }
    dispatch(completeResponse());
    dispatch(setActivityEndTime(event ? activity.id + event : activity.id));

    Actions.push("activity_thanks");
  } else {
    dispatch(setCurrentScreen(event ? activity.id + event : activity.id, next));
  }
};

export const finishActivity = (activity) => (dispatch, getState) => {
  const state = getState();
  const event = currentEventSelector(state);

  dispatch(clearActivityStartTime(activity.id));
  dispatch(completeResponse());
  dispatch(setActivityEndTime(event ? activity.id + event : activity.id));

  dispatch(setCurrentActivity(null));
  Actions.push("activity_end");
};

export const endActivity = (activity) => (dispatch) => {
  dispatch(clearActivityStartTime(activity.id));
  dispatch(setCurrentActivity(activity.id));

  dispatch(setCurrentActivity(null));
};

export const prevScreen = () => (dispatch, getState) => {
  const state = getState();
  const applet = currentAppletSelector(state);
  const screenIndex = currentScreenSelector(state);
  const visibilityArray = itemVisiblitySelector(state);
  const prev = getLastPos(screenIndex, visibilityArray);
  const activity = currentActivitySelector(state);
  const event = currentEventSelector(state);

  if (prev === -1) {
    Actions.pop();
    dispatch(setCurrentActivity(null));
  } else {
    dispatch(setCurrentScreen(event ? activity.id + event : activity.id, prev));
  }
};
