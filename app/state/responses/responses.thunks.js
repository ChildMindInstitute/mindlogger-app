import * as R from "ramda";
import { Alert } from "react-native";
import { Actions } from "react-native-router-flux";
import * as RNLocalize from "react-native-localize";
import i18n from "i18next";
import { getSchedule, replaceResponseData, updateUserTokenBalance } from "../../services/network";
import { downloadAllResponses, uploadResponseQueue } from "../../services/api";
import { cleanFiles } from "../../services/file";
import {
  prepareResponseForUpload,
  getEncryptedData,
} from "../../models/response";
import { scheduleAndSetNotifications } from "../applets/applets.thunks";
import { appletsSelector } from "../applets/applets.selectors";
import {
  responsesSelector,
  uploadQueueSelector,
  currentResponsesSelector,
  currentAppletResponsesSelector,
  currentScreenSelector,
  itemVisiblitySelector,
} from "./responses.selectors";
import {
  authTokenSelector,
  loggedInSelector,
  userInfoSelector,
  userTokenBalanceSelector,
} from "../user/user.selectors";
import { setTokenBalance } from "../user/user.actions";
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
  currentActivityIdSelector,
  currentAppletSelector,
  startedTimesSelector,
  currentActivitySelector,
} from "../app/app.selectors";
import { getNextPos, getLastPos } from "../../services/activityNavigation";

import { prepareResponseKeys } from "../applets/applets.actions";

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
  const applet = currentAppletSelector(state);

  // There is no response in progress, so start a new one

  dispatch(
    createResponseInProgress(applet.id, activity, subjectId, timeStarted)
  );
  dispatch(setCurrentScreen(applet.id, activity.id, 0));
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

  if (activity.isPrize === true) {
    const tokenBalance = userTokenBalanceSelector(state);
    const prizesActivity = R.assocPath(['items', 0, 'info', 'en'],
      `Balance: ${tokenBalance} Token${tokenBalance >= 2 ? 's' : ''}`,
      activity);
    dispatch(createResponseInProgress(applet.id, prizesActivity, subjectId, timeStarted));
    dispatch(setCurrentScreen(applet.id, activity.id, 0));
    dispatch(setCurrentActivity(activity.id));
    Actions.push('take_act');
  } else if (typeof responses.inProgress[applet.id + activity.id] === "undefined") {
    // There is no response in progress, so start a new one
    if (startedTimes && !startedTimes[activity.id]) {
      dispatch(setActivityStartTime(activity.id));
    }
    dispatch(
      createResponseInProgress(applet.id, activity, subjectId, timeStarted)
    );
    dispatch(setCurrentScreen(applet.id, activity.id, 0));
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
              ["inProgress", applet.id + activity.id, "responses"],
              responses
            );
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
            dispatch(setCurrentScreen(applet.id, activity.id, 0));
            dispatch(setCurrentActivity(activity.id));
            Actions.push("take_act");
          },
        },
        {
          text: i18n.t("additional:resume"),
          onPress: () => {
            dispatch(setActivityOpened(true));
            dispatch(setCurrentScreen(applet.id, activity.id, currentScreen || 0));
            dispatch(setCurrentActivity(activity.id));
            Actions.push("take_act");
          },
        },
      ],
      { cancelable: false }
    );
  }
};

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
    .then((responses) => {
      if (loggedInSelector(getState())) {
        dispatch(replaceResponses(responses));
        dispatch(scheduleAndSetNotifications());
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

  for (const applet of applets) {
    dispatch(updateKeys(applet, user));
  }

  const uploadData = [];
  for (const response of responses) {
    const dataSources = {};
    const applet = applets.find((applet) => applet.id === response.appletId);

    for (const responseId in response.dataSources) {
      if (Object.keys(response).length) {
        dataSources[responseId] = getEncryptedData(
          response.dataSources[responseId],
          applet.AESKey
        );
      }
    }

    uploadData.push({
      userPublicKey: applet.userPublicKey,
      appletId: applet.id.split("/").pop(),
      dataSources,
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
  uploadResponseQueue(authToken, uploadQueue, () => {
    // Progress - a response was uploaded
    dispatch(shiftUploadQueue());
  }).finally(() => {
    dispatch(downloadResponses());
  });
};

export const completeResponse = () => (dispatch, getState) => {
  const state = getState();
  // console.log({ state });
  const applet = currentAppletSelector(state);
  // console.log({ applet });
  const inProgressResponse = currentResponsesSelector(state);

  console.log({ inProgressResponse });
  const activity = currentActivitySelector(state);

  if ((!applet.AESKey || !applet.userPublicKey) && config.encryptResponse) {
    dispatch(updateKeys(applet, userInfoSelector(state)));
  }

  if (activity.isPrize === true) {
    const authToken = authTokenSelector(state);
    const selectedPrizeIndex = inProgressResponse["responses"][0];
    const selectedPrize = activity.items[0].valueConstraints.itemList[selectedPrizeIndex];
    updateUserTokenBalance(authToken, -selectedPrize.price)
      .then((res) => {
        const newBalance = res["tokenBalance"];
        dispatch(setTokenBalance(newBalance));
      })
      .catch((e) => {
        console.warn(e.json());
      });
  } else {
    const responseHistory = currentAppletResponsesSelector(state);
    const preparedResponse = prepareResponseForUpload(inProgressResponse, applet, responseHistory);
    dispatch(addToUploadQueue(preparedResponse));
    dispatch(startUploadQueue());
  }

  setTimeout(() => {
    // Allow some time to navigate back to ActivityList
    dispatch(
      removeResponseInProgress(applet.id + inProgressResponse.activity.id)
    );
  }, 300);
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
    dispatch(setCurrentActivity(null));
    dispatch(setActivityEndTime(applet.id + activityId));
    Actions.push("activity_thanks");
  } else {
    dispatch(setCurrentScreen(applet.id, activityId, next));
  }
};

export const finishActivity = (activity) => (dispatch) => {
  dispatch(clearActivityStartTime(activity.id));
  dispatch(completeResponse());
  dispatch(setCurrentActivity(null));
  Actions.push("activity_end");
};

export const endActivity = (activity) => (dispatch) => {
  dispatch(clearActivityStartTime(activity.id));
  dispatch(setCurrentActivity(activity.id));
  dispatch(completeResponse());
  dispatch(setCurrentActivity(null));
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
    dispatch(setCurrentActivity(null));
  } else {
    dispatch(setCurrentScreen(applet.id, activityId, prev));
  }
};
