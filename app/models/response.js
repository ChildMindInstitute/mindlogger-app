import * as R from 'ramda';
import { Dimensions } from 'react-native';
import packageJson from '../../package.json';
import config from '../config';
import { encryptData } from '../services/encryption';
import { evaluateCumulatives, getSubScaleResult, getValuesFromResponse, getFinalSubScale } from '../services/scoring';
import { updateTrackerAggregation, getTokenSummary } from '../services/tokens';
import { getAlertsFromResponse } from '../services/alert';
import { decryptData } from "../services/encryption";
import {
  activityTransformJson,
  itemTransformJson,
  itemAttachExtras,
  ORDER,
} from "./json-ld";
import moment from 'moment';

// Convert ids like "applet/some-id" to just "some-id"
const trimId = (typedId) => typedId.split("/").pop();

export const transformResponses = (responses) => R.unnest(responses);
export const getEncryptedData = (response, key) =>
  encryptData({ key, text: JSON.stringify(response) });

export const prepareResponseForUpload = (
  inProgressResponse,
  appletMetaData,
  responseHistory,
  isTimeout,
  finishedTime
) => {
  const languageKey = "en";
  const { activity, responses, subjectId, events } = inProgressResponse;
  const appletVersion = appletMetaData.schemaVersion[languageKey];
  const { cumActivities, nonHiddenCumActivities } = evaluateCumulatives(responses, activity);

  const scheduledTime = activity.event && activity.event.scheduledTime;
  let cumulative = responseHistory.token ? responseHistory.token.cumulative : null;
  let tokenChanged = false, trackerChanged = false;
  const today = moment().format('YYYY-MM-DD')
  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

  let trackerAggregations = responseHistory.token ?
    [
      responseHistory.token.trackerAggregation.find(d => d.date == today) || { data: {}, id: 0, date: today },
      responseHistory.token.trackerAggregation.find(d => d.date == yesterday) || { data: {}, id: 0, date: yesterday }
    ] : [];

  const alerts = [];
  for (let i = 0; i < responses.length; i++) {
    const item = activity.items[i];

    if (item.valueConstraints) {
      const { valueType, responseAlert, enableNegativeTokens } = item.valueConstraints;

      if (responses[i] !== null && responses[i] !== undefined && responseAlert) {
        const messages = getAlertsFromResponse(item, responses[i].value !== undefined ? responses[i].value : responses[i]);
        messages.forEach(msg => {
          alerts.push({
            id: activity.items[i].id.split('/')[1],
            schema: activity.items[i].schema,
            message: msg
          });
        })
      }

      try {
        if (valueType && valueType.includes('token') && responses[i] !== undefined && responses[i] !== null) {
          const responseValues = getValuesFromResponse(item, responses[i].value) || [];
          const positiveSum = responseValues.filter(v => v >= 0).reduce((a, b) => a + b, 0);
          const negativeSum = responseValues.filter(v => v < 0).reduce((a, b) => a + b, 0);
          cumulative += positiveSum;
          if (enableNegativeTokens && cumulative + negativeSum >= 0) {
            cumulative += negativeSum;
          }

          tokenChanged = true;
        }
      } catch (error) {
        console.log("ERR: ", error);
      }

      if (item.inputType == 'pastBehaviorTracker' || item.inputType == 'futureBehaviorTracker') {
        const { value } = (responses[i] || {});
        if (value && Object.keys(value).length) {
          trackerChanged = true;
          updateTrackerAggregation(trackerAggregations, item.id.split('/').pop(), value)
        }
      }
    }
  }
  trackerAggregations = trackerAggregations.filter(aggregation => Object.keys(aggregation.data).length > 0);

  const tokenSummary = getTokenSummary(activity, responses);
  if (tokenSummary.total > 0) {
    tokenChanged = true;
    cumulative += tokenSummary.total;
  }

  const responseData = {
    activity: {
      id: trimId(activity.id),
      schema: activity.schema,
      schemaVersion: activity.schemaVersion[languageKey],
    },
    applet: {
      id: trimId(activity.appletId),
      schema: activity.appletSchema,
      schemaVersion: appletVersion,
    },
    subject: subjectId,
    responseStarted: inProgressResponse.timeStarted,
    responseCompleted: Date.now(),
    timeout: isTimeout ? 1 : 0,
    event: activity.event ? {
      id: activity.event.id,
      scheduledTime: new Date(scheduledTime).getTime(),
      finishedTime: finishedTime.getTime()
    } : null,
    client: {
      appId: "mindlogger-mobile",
      appVersion: packageJson.version,
      width: Dimensions.get("screen").width,
      height: Dimensions.get("screen").height,
    },
    languageCode: languageKey,
    alerts,
    nextActivities: cumActivities.concat(nonHiddenCumActivities).map(name => {
      const activity = appletMetaData.activities.find(activity => activity.name.en == name)
      return activity && activity.id.split('/').pop()
    }).filter(id => id)
  };

  let subScaleResult = [];
  if (activity.subScales) {
    subScaleResult = getSubScaleResult(
      activity.subScales,
      responses,
      activity.items
    )
  }

  if (tokenChanged || trackerChanged) {
    const changes = responseHistory.token.tokens.find(change => change.date == today) || { data: [], id: 0, date: today };

    const offset = cumulative - responseHistory.token.cumulative;

    changes.data.push({ time: new Date().getTime(), value: offset, spend: false })

    responseData['token'] = {};

    if (tokenChanged) {
      responseData['token'] = { cumulative, changes: { ...changes } }
    }

    if (trackerChanged) {
      responseData['token'].trackerAggregations = trackerAggregations;
    }
  }

  /** process for encrypting response */
  if (config.encryptResponse && appletMetaData.encryption) {
    const mediaItems = [
      'photo',
      'video',
      'audioRecord',
      'drawing',
      'audioImageRecord'
    ];

    const formattedResponses = activity.items.reduce(
      (accumulator, item, index) => {
        let response = index;

        if (mediaItems.includes(item.inputType)) {
          const d = responses[index]?.value || {};
          response = { ...d, index };
        }

        return {
          ...accumulator, [item.schema]: response
        }
      },
      {},
    );
    const dataSource = getEncryptedData(responses, appletMetaData.AESKey);
    responseData['responses'] = formattedResponses;
    responseData['dataSource'] = dataSource;
    responseData['events'] = getEncryptedData(events.map(event => ({
      ...event,
      screen: activity.items[event.screen].id.split('/').pop()
    })), appletMetaData.AESKey);

    if (activity.finalSubScale) {
      subScaleResult.push(getFinalSubScale(responses, activity.items, activity.finalSubScale.isAverageScore, activity.finalSubScale.lookupTable));
    }

    if (subScaleResult.length) {
      responseData['subScaleSource'] = getEncryptedData(subScaleResult, appletMetaData.AESKey);
      responseData['subScales'] = (activity.subScales || []).reduce((accumulator, subScale, index) => ({ ...accumulator, [subScale.variableName]: index }), {});

      if (activity.finalSubScale) {
        responseData['subScales'][activity.finalSubScale.variableName] = (activity.subScales || []).length;
      }
    }

    if (responseData['token']) {
      if (tokenChanged) {
        responseData['token'].changes.data = getEncryptedData(responseData['token'].changes.data, appletMetaData.AESKey)
      }

      if (trackerChanged) {
        for (let aggregation of responseData['token'].trackerAggregations) {
          aggregation.data = getEncryptedData(aggregation.data, appletMetaData.AESKey)
        }
      }
    }

    responseData['userPublicKey'] = appletMetaData.userPublicKey;
  } else {
    const formattedResponses = activity.items.reduce((accumulator, item, index) => {
      return {
        ...accumulator,
        [item.schema]: responses[index],
      };
    }, {});

    responseData['responses'] = formattedResponses;
    responseData['events'] = events.map(event => ({
      ...event,
      screen: activity.items[event.screen].id.split('/').pop()
    }));

    if (activity.subScales) {
      responseData['subScales'] = activity.subScales.reduce((accumulator, subScale, index) => {
        return {
          ...accumulator,
          [subScale.variableName]: subScaleResult[index],
        }
      });
    }

    if (activity.finalSubScale) {
      responseData['subScales'] = responseData['subScales'] || {};
      responseData['subScales'][activity.finalSubScale.variableName] =
        getFinalSubScale(responses, activity.items, activity.finalSubScale.isAverageScore, activity.finalSubScale.lookupTable);
    }
  }


  return responseData;
};

export const getTokenUpdateInfo = (
  offset,
  data,
  appletMetaData,
  rewardTime=0
) => {
  const cumulative = data.cumulative + offset;

  const now = moment().format('YYYY-MM-DD')
  const changes = rewardTime && data.tokens.find(change => change.date == now) || { data: [], id: 0, date: now };

  if (rewardTime) {
    changes.data = { time: rewardTime, value: offset }
  }
  else if (offset) {
    changes.data.push({ time: new Date().getTime(), value: offset, spend: true })
  }

  if (config.encryptResponse && appletMetaData.encryption) {
    changes.data = getEncryptedData(changes.data, appletMetaData.AESKey)

    return {
      cumulative,
      changes,
      userPublicKey: appletMetaData['userPublicKey']
    }
  }

  return {
    cumulative,
    changes,
  }
};

export const mergeResponses = (old, latest) => {
  if (old.dataSources) {
    Object.keys(old.dataSources).forEach(key => {
      if (!latest.dataSources[key]) {
        latest.dataSources[key] = old.dataSources[key];
      }
    })
  }

  if (old.responses) {
    Object.keys(old.responses).forEach(item => {
      if (!latest.responses[item]) {
        latest.responses[item] = old.responses[item];
      }
    })
  }
}

export const decryptAppletResponses = (applet, responses) => {
  if (responses.dataSources && applet.encryption) {
    Object.keys(responses.dataSources).forEach((key) => {
      try {
        responses.dataSources[key] = JSON.parse(
          decryptData({
            key: applet.AESKey,
            text: responses.dataSources[key],
          })
        );
      } catch {
        responses.dataSources[key] = {};
        responses.hasDecryptionError = true;
      }
    });
  }

  if (applet.encryption && responses.token) {
    for (const key of ['tokens', 'trackers', 'trackerAggregation']) {
      responses.token[key].forEach(change => {
        try {
          const data = typeof change.data !== 'object' ? JSON.parse(
            decryptData({
              key: applet.AESKey,
              text: change.data,
            })
          ) : change.data;

          change.data = data;
        } catch {
          change.data = []
        }
      })
    }

    responses.token.trackers = responses.token.trackers.filter(tracker => !Array.isArray(tracker.data) || tracker.data.length)
    responses.token.trackerAggregation = responses.token.trackerAggregation.filter(tracker => !Array.isArray(tracker.data) || tracker.data.length)
  }

  /** replace response to plain format */
  if (responses.responses) {
    const items = [];
    for (const activity of applet.activities) {
      for (const item of activity.items) {
        items[item.schema] = item;
      }
    }

    Object.keys(responses.responses).forEach((item) => {
      for (let response of responses.responses[item]) {
        const inputType = items[item] && items[item].inputType;

        if (
          response.value &&
          response.value.src &&
          response.value.ptr !== undefined
        ) {
          if (inputType == 'stabilityTracker' || inputType == 'visual-stimulus-response' || inputType == 'drawing' || inputType == 'trail') {
            responses.dataSources[response.value.src][response.value.ptr] = null;
          }

          response.value =
            responses.dataSources[response.value.src][response.value.ptr];
        }

        if (response.value && response.value.value !== undefined) {
          response.value = response.value.value;
        }
      }

      responses.responses[item] = responses.responses[item].filter(
        (response) => response.value !== undefined && response.value !== null
      );
      if (responses.responses[item].length === 0) {
        delete responses.responses[item];
      }
    });
  }

  if (responses.items) {
    for (let itemId in responses.items) {
      const item = responses.items[itemId];
      responses.items[itemId] = {
        ...itemAttachExtras(itemTransformJson(item), itemId),
        original: item.original,
        activityId: item.activityId,
      };
    }
  }

  if (responses.itemReferences) {
    for (let version in responses.itemReferences) {
      for (let itemId in responses.itemReferences[version]) {
        const id = responses.itemReferences[version][itemId];
        if (id) {
          const item = responses.items[id];
          responses.itemReferences[version][itemId] = item;
        }
      }
    }
  }

  if (responses.activities) {
    for (let activityId in responses.activities) {
      const activity = responses.activities[activityId];
      if (activity[ORDER]) {
        delete activity[ORDER];
      }

      responses.activities[activityId] = {
        ...activityTransformJson(activity, []),
        original: activity.original,
      };
    }
  }

  return { ...responses };
}
