import _ from "lodash";
import * as R from "ramda";
import { Alert } from "react-native";
import { Actions } from "react-native-router-flux";
import * as RNLocalize from "react-native-localize";
import i18n from "i18next";
import moment from "moment";
import NetInfo from "@react-native-community/netinfo";
import { getSchedule, replaceResponseData, updateUserTokenBalance } from "../../services/network";
import { downloadAllResponses, downloadAppletResponse, uploadResponseQueue } from "../../services/api";
import { cleanFiles } from "../../services/file";
import { evaluateCumulatives } from '../../services/scoring';
import {
  prepareResponseForUpload,
  getEncryptedData,
  getTokenUpdateInfo,
} from "../../models/response";
import { storeData } from "../../services/storage";
import { appletsSelector } from "../applets/applets.selectors";
import {
  setCumulativeActivities,
  setActivityFlowOrderIndex
} from "../activities/activities.actions";
import {
  responsesSelector,
  uploadQueueSelector,
  uploaderIdSelector,
  currentResponsesSelector,
  currentAppletResponsesSelector,
  currentScreenSelector,
  itemVisiblitySelector,
  currentAppletTokenBalanceSelector,
  lastResponseTimeSelector,
} from "./responses.selectors";
import {
  authTokenSelector,
  loggedInSelector,
  userInfoSelector,
} from "../user/user.selectors";
import { orderIndexSelector } from "../activities/activities.selectors";
import {
  createResponseInProgress,
  setDownloadingResponses,
  replaceResponses,
  setResponsesDownloadProgress,
  removeResponseInProgress,
  addToUploadQueue,
  shiftUploadQueue,
  setCurrentScreen,
  setLastResponseTime,
  setSummaryScreen,
  setUploaderId,
  replaceAppletResponses,
  setActivityOpened,
  setAnswer,
} from "./responses.actions";
import {
  setActivityStartTime,
  setCurrentActivity,
  setClosedEvents,
  clearActivityStartTime,
  setActivityEndTime,
  setCurrentEvent
} from "../app/app.actions";

import {
  currentEventSelector,
  currentAppletSelector,
  startedTimesSelector,
  currentActivitySelector,
} from "../app/app.selectors";
import { getNextPos, getLastPos } from "../../services/activityNavigation";
import { getTokenIncreaseForNegativeBehaviors } from "../../services/tokens";
import { sendPDFExport } from "../../services/reports";

import { prepareResponseKeys, setActivityAccess } from "../applets/applets.actions";

import { getAESKey, getPublicKey } from "../../services/encryption";
import { sendData } from "../../services/socket";
import config from "../../config";
import { sync } from "../app/app.thunks";

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

  const visibilityArray = itemVisiblitySelector(state);
  const next = getNextPos(-1, visibilityArray);

  // There is no response in progress, so start a new one

  dispatch(
    createResponseInProgress(applet.id, activity, subjectId, timeStarted)
  );
  dispatch(setCurrentScreen(event ? activity.id + event : activity.id, 0));
  dispatch(setCurrentActivity(activity.id));
  Actions.push("take_act");
};

export const startResponse = (activity) => (dispatch, getState) => {
  dispatch(setCurrentEvent(activity.event ? activity.event.id : null));

  const state = getState();
  const { responses, user } = state;
  const startedTimes = startedTimesSelector(state);
  const subjectId = R.path(["info", "_id"], user);
  const timeStarted = Date.now();
  const currentScreen = currentScreenSelector(state);
  const applet = currentAppletSelector(state);
  const index = activity.event ? activity.id + activity.event.id : activity.id;
  const visibilityArray = itemVisiblitySelector(state);
  const next = getNextPos(-1, visibilityArray);
  const event = currentEventSelector(state);
  const orderIndex = orderIndexSelector(state) || {};

  if (activity.isPrize === true) {
    const tokenBalance = currentAppletTokenBalanceSelector(state).cumulativeToken;
    const prizesActivity = R.assocPath(['items', 0, 'info', 'en'],
      `Balance: ${tokenBalance} Token${tokenBalance >= 2 ? 's' : ''}`,
      activity);
    dispatch(createResponseInProgress(applet.id, prizesActivity, subjectId, timeStarted, activity.items));
    dispatch(setCurrentScreen(event ? activity.id + event : activity.id, next));

    sendData('start_activity', activity.id, applet.id);

    Actions.push('take_act');
  } else if (typeof responses.inProgress[index] === "undefined") {
    // There is no response in progress, so start a new one
    if (activity.event
      && activity.event.data.timedActivity.allow
      && startedTimes
      && !startedTimes[activity.id + activity.event.id]
    ) {
      dispatch(setActivityStartTime(activity.id + activity.event.id));
    }

    if (activity.isActivityFlow) {
      const currentActOrderIndex = orderIndex[activity.id] || 0;
      const currentActName = activity.order[currentActOrderIndex];
      const currentActivity = applet.activities.find(act => act.name.en === currentActName);

      dispatch(createResponseInProgress(applet.id, activity, subjectId, timeStarted, currentActivity.items));
    } else {
      dispatch(createResponseInProgress(applet.id, activity, subjectId, timeStarted, activity.items));
    }
    dispatch(setCurrentScreen(event ? activity.id + event : activity.id, next));
    sendData('start_activity', activity.id, applet.id);
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

            if (activity.event
              && activity.event.data.timedActivity.allow
              && startedTimes
              && !startedTimes[activity.id + activity.event.id]
            ) {
              dispatch(setActivityStartTime(activity.id + activity.event.id));
            }

            cleanFiles(itemResponses);
            dispatch(setActivityOpened(true));

            if (activity.isActivityFlow) {
              const currentActOrderIndex = orderIndex[activity.id] || 0;
              const currentActName = activity.order[currentActOrderIndex];
              const currentActivity = applet.activities.find(act => act.name.en === currentActName);

              dispatch(createResponseInProgress(applet.id, activity, subjectId, timeStarted, currentActivity.items));
            } else {
              dispatch(createResponseInProgress(applet.id, activity, subjectId, timeStarted, activity.items));
            }
            dispatch(setCurrentScreen(event ? activity.id + event : activity.id, next));
            sendData('restart_activity', activity.id, applet.id);
            Actions.push("take_act");
          },
        },
        {
          text: i18n.t("additional:resume"),
          onPress: () => {
            if (activity.event
              && activity.event.data.timedActivity.allow
              && startedTimes
              && !startedTimes[activity.id + activity.event.id]
            ) {
              dispatch(setActivityStartTime(activity.id + activity.event.id));
            }

            dispatch(setActivityOpened(true));
            dispatch(setCurrentScreen(event ? activity.id + event : activity.id, currentScreen || next, responses.inProgress[index][currentScreen].startTime));

            sendData('resume_activity', activity.id, applet.id);

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

  if ((!applet.AESKey || !applet.userPublicKey) && config.encryptResponse) {
    dispatch(updateKeys(applet, userInfo));
  }

  dispatch(setDownloadingResponses(true));

  const timezone = RNLocalize.getTimeZone();
  getSchedule(authToken, timezone).then((schedule) => {
    dispatch(setLastResponseTime(schedule));
  });

  return downloadAppletResponse(authToken, applet)
    .then(async (responses) => {
      if (loggedInSelector(getState())) {
        await storeData('ml_responses', responses);
        dispatch(replaceResponses(responses));
      }
    })
    .finally(() => {
      dispatch(setDownloadingResponses(false));
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
    dispatch(setLastResponseTime(schedule));
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

    const applet = applets.find((applet) => applet.id === response.appletId);

    for (const responseId in response.dataSources) {
      if (Object.keys(response).length) {
        dataSources[responseId] = getEncryptedData(
          response.dataSources[responseId],
          applet.AESKey
        );
      }
    }

    if (Object.keys(dataSources).length) {
      uploadData.push({
        userPublicKey: applet.userPublicKey,
        appletId: applet.id.split("/").pop(),
        dataSources,
      });
    }
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
    dispatch(setLastResponseTime(schedule));
  });
};

export const startUploadQueue = (activityId) => (dispatch, getState) => {
  const state = getState();
  const uploadQueue = uploadQueueSelector(state);
  const authToken = authTokenSelector(state);
  const applet = currentAppletSelector(state);
  const lastResponseTime = lastResponseTimeSelector(state);

  if (!uploadQueue.length) {
    return Promise.resolve();
  }

  const uploaderId = Date.now();

  dispatch(setUploaderId(uploaderId));

  const getUploaderId = () => {
    const state = getState();
    return uploaderIdSelector(state);
  }

  if (!state.app.isConnected) {
    if (activityId) {
      dispatch(setLastResponseTime({ ...lastResponseTime, [applet.id]: { ...lastResponseTime[applet.id], [activityId]: new Date().toISOString() } }));
    }

    return Promise.resolve();
  }

  return uploadResponseQueue(authToken, uploadQueue, () => {
    // Progress - response is being processed
    dispatch(shiftUploadQueue());
  }, uploaderId, getUploaderId).finally(() => {
    if (getUploaderId() != uploaderId) {
      return;
    }

    try {
      NetInfo.fetch().then(state => {
        if (!state.isConnected && activityId) {
          dispatch(setLastResponseTime({ ...lastResponseTime, [applet.id]: { ...lastResponseTime[applet.id], [activityId]: new Date().toISOString() } }));
        }
      });
    } catch (error) {
      console.warn(error);
    }

    if (applet) {
      return dispatch(downloadResponse());
    }

    return dispatch(sync());
  });
};

export const refreshTokenBehaviors = () => (dispatch, getState) => {
  const state = getState();
  const authToken = authTokenSelector(state);
  const applets = appletsSelector(state);
  const responseHistory = responsesSelector(state);
  const now = new Date(), processes = [];

  for (let i = 0; i < applets.length; i++) {
    try {
      const applet = applets[i];
      const { lastRewardTime, tokenTimes } = responseHistory[i].token;

      if (!tokenTimes.length) {
        continue;
      }

      const lastTokenTime = new Date(tokenTimes[tokenTimes.length - 1])

      let refreshTime = new Date(
        lastTokenTime.getFullYear(),
        lastTokenTime.getMonth(),
        lastTokenTime.getDate(),
        3
      );

      if (refreshTime < lastTokenTime) {
        refreshTime.setDate(refreshTime.getDate() + 1)
      }

      let process = null;

      for (let k = 0; k < 2; k++) {
        if (refreshTime.getTime() >= now.getTime() || refreshTime.getTime() <= lastRewardTime) {
          refreshTime.setDate(refreshTime.getDate() + 1)
          continue;
        }

        let offset = 0;

        for (const activity of applet.activities) {
          for (const item of activity.items) {
            if (item.inputType == 'pastBehaviorTracker' || item.inputType == 'futureBehaviorTracker') {
              offset += getTokenIncreaseForNegativeBehaviors(
                item,
                tokenTimes,
                refreshTime,
                responseHistory[i].responses[item.schema] || []
              );
            }
          }
        }

        const updates = getTokenUpdateInfo(
          offset,
          responseHistory[i].token,
          applet,
          refreshTime.getTime()
        );

        const calculation = updateUserTokenBalance(
          authToken,
          applet.id.split('/').pop(),
          updates.cumulative,
          updates.changes,
          applet.schemaVersion.en,
          updates.userPublicKey || null,
          refreshTime.getTime()
        );

        process = !process ? calculation : process.then(() => calculation);
        refreshTime.setDate(refreshTime.getDate() + 1)
      }

      if (process) {
        processes.push(process);
      }
    } catch (e) {
      console.log('error', e);
    }
  }

  return Promise.all(processes).then(() => {
    if (processes.length) {
      dispatch(sync());
    }
  })
}

export const completeResponse = (isTimeout = false, isFlow = false) => (dispatch, getState) => {
  const state = getState();
  const subjectId = R.path(["info", "_id"], state.user);
  const authToken = authTokenSelector(state);
  const applet = currentAppletSelector(state);
  const inProgressResponse = currentResponsesSelector(state);
  const event = currentEventSelector(state);
  const orderIndex = orderIndexSelector(state);
  const currentActOrderIndex = orderIndex[inProgressResponse.activity.id] || 0;
  let activity = currentActivitySelector(state);

  if (!activity) {
    const currentActName = inProgressResponse.activity.order[currentActOrderIndex];
    activity = applet.activities.find(act => act.name.en === currentActName);
    inProgressResponse.activity = {
      ...inProgressResponse.activity,
      ...activity,
      activityFlowId: inProgressResponse.activity.id,
      activityFlowOrder: inProgressResponse.activity.order,
      events: inProgressResponse.activity.events
    }
  }

  if ((!applet.AESKey || !applet.userPublicKey) && config.encryptResponse) {
    dispatch(updateKeys(applet, userInfoSelector(state)));
  }

  const finishedTime = new Date();
  const responseHistory = currentAppletResponsesSelector(state);
  let uploader = Promise.resolve();

  if (activity.isPrize === true) {
    const selectedPrizeIndex = inProgressResponse["responses"][0];
    const selectedPrize = activity.items[0].valueConstraints.itemList[selectedPrizeIndex];

    const updates = getTokenUpdateInfo(
      -selectedPrize.price,
      responseHistory[i].token,
      applet,
    );

    uploader = updateUserTokenBalance(
      authToken,
      applet.id.split('/').pop(),
      updates.cumulative,
      updates.changes,
      applet.schemaVersion.en,
      updates.userPublicKey || null
    ).then(() => {
      return dispatch(downloadResponses())
    })
  } else {
    const preparedResponse = prepareResponseForUpload(
      inProgressResponse, applet, responseHistory, isTimeout, finishedTime
    );

    dispatch(addToUploadQueue(preparedResponse));
    uploader = dispatch(startUploadQueue(inProgressResponse?.activity?.id));
  }

  if (event) {
    dispatch(setClosedEvents({
      [event]: finishedTime.getTime()
    }))
  }

  uploader.finally(() => {
    const activity = {
      ...inProgressResponse.activity
    };

    if (activity.activityFlowId) {
      const flowId = activity.activityFlowId;

      dispatch(
        removeResponseInProgress(activity.event ? flowId + activity.event.id : flowId)
      );

      const currentActOrderIndex = orderIndex[activity.id] || 0;

      if (!isFlow) {
        sendPDFExport(
          authToken,
          applet,
          applet.activities.filter(act => activity.activityFlowOrder.includes(act.name.en)),
          currentAppletResponsesSelector(state),
          activity.id,
          flowId,
        );
      }

      if (isFlow) {
        const currentActName = activity.activityFlowOrder[currentActOrderIndex];
        const currentActivity = applet.activities.find(act => act.name.en === currentActName);

        dispatch(
          createResponseInProgress(applet.id, applet.activityFlows.find(flow => flow.id == flowId), subjectId, Date.now(), currentActivity.items)
        );
        Actions.replace("take_act");
      }
    } else {
      dispatch(
        removeResponseInProgress(activity.event ? activity.id + activity.event.id : activity.id)
      );

      if (activity.allowExport) {
        sendPDFExport(
          authToken,
          applet,
          [activity],
          currentAppletResponsesSelector(state),
          activity.id,
        );
      }
    }
  })
};

export const nextActivity = (isNext = false) => (dispatch, getState) => {
  const state = getState();
  const applet = currentAppletSelector(state);
  const inProgress = currentResponsesSelector(state);
  const orderIndex = orderIndexSelector(state);
  const event = currentEventSelector(state);
  const { activity } = inProgress;
  const currentActOrderIndex = orderIndex[activity.id] || 0;

  if (isNext) {
    dispatch(setCurrentScreen(event ? activity.id + event : activity.id, 0, new Date().getTime()));
    if (activity.nextAccess) {
      dispatch(setActivityAccess(applet.id + activity.id));
    }
    sendData('finish_activity', activity.id, applet.id);
    dispatch(setActivityFlowOrderIndex({
      activityId: activity.id,
      index: currentActOrderIndex + 1
    }));
    dispatch(setActivityEndTime(event ? activity.id + event : activity.id));
    dispatch(completeResponse(false, true));
  } else {
    Actions.replace("take_act");
  }
}

export const nextScreen = (timeElapsed = 0) => (dispatch, getState) => {
  const state = getState();
  const applet = currentAppletSelector(state);
  const visibilityArray = itemVisiblitySelector(state);
  const event = currentEventSelector(state);
  const inProgress = currentResponsesSelector(state);
  const orderIndex = orderIndexSelector(state);
  const activity = inProgress.activity;
  const currentActOrderIndex = orderIndex[activity.id] || 0;

  let screenIndex = currentScreenSelector(state);
  let activityObj = { ...activity };
  let next = -1;

  if (activity.isActivityFlow) {
    const currentActName = activity.order[currentActOrderIndex];
    activityObj = applet.activities.find(act => act.name.en === currentActName);
  }

  const item = activityObj.items[screenIndex];

  if (item.inputType == 'visual-stimulus-response' && item.inputs.blockType === 'practice' && !item.inputs.lastPractice) {
    const responses = inProgress.responses[screenIndex];
    let correctCount = 0, totalCount = 0;
    for (let i = 0; i < responses.length; i++) {
      if (responses[i].tag == 'trial') {
        totalCount++;
        if (responses[i].correct) {
          correctCount++;
        }
      }
    }

    if (
      item.inputs.minimumAccuracy &&
      correctCount * 100 >= totalCount * item.inputs.minimumAccuracy
    ) {
      screenIndex = activity.items.findIndex(item => item.inputs.lastPractice);
    }
  }

  do {
    const { timer, delay } = activityObj.items[screenIndex];
    let totalTime = timer + (delay || 0);

    if (next < 0 || (timer && timeElapsed >= totalTime)) {
      next = getNextPos(screenIndex, visibilityArray, timeElapsed);
      timeElapsed -= totalTime;
      screenIndex = next;
    } else {
      break;
    }
  } while (next >= 0);

  if (timeElapsed < 0) {
    timeElapsed = 0;
  }

  if (next === -1) {
    if (activity.isActivityFlow && currentActOrderIndex < activity.order.length - 1) {
      Actions.replace("activity_flow_submit");
    } else {
      setTimeout(() => {
        if (activity.nextAccess) {
          dispatch(setActivityAccess(applet.id + activity.id));
        }
        sendData('finish_activity', activity.id, applet.id);
        dispatch(completeResponse());
        dispatch(setActivityEndTime(event ? activity.id + event : activity.id));
        if (activity.isActivityFlow) {
          dispatch(setActivityFlowOrderIndex({
            activityId: activity.id,
            index: 0
          }));
        }
      });

      Actions.push("activity_thanks");
    }
  } else {
    dispatch(setCurrentScreen(event ? activity.id + event : activity.id, next, new Date().getTime() - timeElapsed));

    const item = activityObj.items[next];

    if (item.inputType == 'futureBehaviorTracker') {
      const { timeScreen } = item.valueConstraints;
      const index = activityObj.items.findIndex(item => item.variableName == timeScreen);
      const timeLimit = inProgress.responses[index] && inProgress.responses[index].value || 0;

      dispatch(setAnswer(inProgress.activity, next, {
        timerActive: true,
        value: undefined,
        timeLeft: !timeLimit ? -1 : timeLimit * 60 * 1000,
        timeLimit: timeLimit * 60 * 1000
      }))
    }
  }
};

export const finishActivity = (activity) => (dispatch, getState) => {
  const state = getState();
  const event = currentEventSelector(state);

  dispatch(
    clearActivityStartTime(activity.event ? activity.id + activity.event.id : activity.id)
  );
  dispatch(completeResponse());
  dispatch(setActivityEndTime(event ? activity.id + event : activity.id));

  dispatch(setCurrentActivity(null));
  Actions.push("activity_end");
};

export const endActivity = (activity) => (dispatch) => {
  dispatch(
    clearActivityStartTime(activity.event ? activity.id + activity.event.id : activity.id)
  );
  dispatch(setCurrentActivity(activity.id));

  dispatch(setCurrentActivity(null));
};

export const prevScreen = () => (dispatch, getState) => {
  const state = getState();
  const screenIndex = currentScreenSelector(state);
  const visibilityArray = itemVisiblitySelector(state);
  const prev = getLastPos(screenIndex, visibilityArray);
  const inProgress = currentResponsesSelector(state);
  const { activity } = inProgress;
  const event = currentEventSelector(state);

  if (prev === -1) {
    Actions.pop();
  } else {
    dispatch(setCurrentScreen(event ? activity.id + event : activity.id, prev));
  }
};
