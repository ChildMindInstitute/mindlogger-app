import { createSelector } from "reselect";
import * as R from "ramda";
import { testVisibility } from "../../services/visibility";
import { appletsSelector } from "../applets/applets.selectors";
import { parseAppletEvents } from '../../models/json-ld';
import { IS_VIS } from "../../models/json-ld";

export const responsesSelector = R.path(["responses", "responseHistory"]);

export const uploadQueueSelector = R.path(["responses", "uploadQueue"]);
export const uploaderIdSelector = R.path(["responses", "uploaderId"])

export const currentBehaviorSelector = R.path(["responses", "currentBehavior"]);

export const isDownloadingResponsesSelector = R.path([
  "responses",
  "isDownloadingResponses",
]);

export const downloadProgressSelector = R.path([
  "responses",
  "downloadProgress",
]);

export const inProgressSelector = R.path(["responses", "inProgress"]);

export const activityOpenedSelector = R.path(["responses", "activityOpened"]);

export const lastResponseTimeSelector = R.path(["responses", "lastResponseTime"]);

export const currentAppletResponsesSelector = createSelector(
  responsesSelector,
  R.path(["app", "currentApplet"]),
  (responses, currentApplet) => {
    let currentAppletResponses = R.filter(
      (x) => x.appletId === currentApplet,
      responses
    );
    if (currentAppletResponses.length === 1) {
      // eslint-disable-next-line
      currentAppletResponses = currentAppletResponses[0];
    } else {
      currentAppletResponses = {};
    }
    return currentAppletResponses;
  }
);

export const currentAppletTokenBalanceSelector = createSelector(
  currentAppletResponsesSelector,
  (responseHistory) => {
    return responseHistory.token
      ? responseHistory.token.cumulative
      : null;
  }
)

export const currentResponsesSelector = createSelector(
  R.path(["app", "currentActivity"]),
  R.path(["app", "currentEvent"]),
  inProgressSelector,
  (activityId, eventId, inProgress) => {
    return inProgress[eventId ? activityId + eventId : activityId]
  }
);

export const isSummaryScreenSelector = createSelector(
  currentResponsesSelector,
  (responses) => responses?.isSummaryScreen || false
)

export const isSplashScreenSelector = createSelector(
  currentResponsesSelector,
  (responses) => responses?.isSplashScreen || false
)

export const currentScreenSelector = createSelector(
  currentResponsesSelector,
  R.path(["screenIndex"])
);

export const itemStartTimeSelector = createSelector(
  currentResponsesSelector,
  (current) => {
    const screenIndex = current.screenIndex;

    return current[screenIndex] && current[screenIndex].startTime || 0;
  }
)

export const itemVisiblitySelector = createSelector(
  currentResponsesSelector,
  R.path(["app", "currentActivity"]),
  R.path(["applets", "applets"]),
  R.path(["activities", "orderIndex"]),
  lastResponseTimeSelector,
  (current, activityId, applets, orderIndex, lastResponseTimes) => {
    const currentApplets = applets.map((applet) => parseAppletEvents(applet));
    const currentActivity = currentApplets.reduce(
      (acc, applet) => [
        ...acc,
        ...applet.activities,
        ...applet.activityFlows,
      ],
      [],
    ).find(activity => activity.id === activityId);
    if (!current && !currentActivity) {
      return [];
    }
    const responses = current ? current.responses : [];
    const activity = current ? current.activity : currentActivity;
    const applet = applets.find(applet => applet.id == activity.appletId);
    const responseTimes = {};

    for (const activity of applet.activities) {
      responseTimes[activity.name.en.replace(/\s/g, '_')] = (lastResponseTimes[applet.id] || {})[activity.id];
    }

    if (activity.isActivityFlow) {
      const activityOrderIndex = orderIndex && orderIndex[activity.id] || 0;
      const activityOrder = activity.activityFlowId ? activity.activityFlowOrder : activity.order;
      const flowActivity = applet.activities.find(act => act.name.en === activityOrder[activityOrderIndex]);

      return flowActivity ?.addProperties.map((property, index) => {
        if (!flowActivity.items[index] || flowActivity.items[index].isVis) {
          return false;
        }
        return testVisibility(property[IS_VIS][0]['@value'], flowActivity.items, responses, responseTimes)
      }) || [];
    }

    return activity ?.addProperties.map((property, index) => {
      if (!activity.items[index] || activity.items[index].isVis) {
        return false;
      }
      return testVisibility(property[IS_VIS][0]['@value'], activity.items, responses, responseTimes)
    });
  }
);

export const challengePhaseLambdaSelector = createSelector(
  currentResponsesSelector,
  ({ responses, screenIndex }) => {
    for (let i = 0; i < screenIndex; i++) {
      if (responses[i] && responses[i].phaseType == 'challenge-phase') {
        return responses[i].maxLambda;
      }
    }

    return 0;
  }
);
