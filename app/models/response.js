import * as R from 'ramda';
import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import packageJson from '../../package.json';
import config from '../config';
import { encryptData } from '../services/encryption';
import { getScoreFromLookupTable, getValuesFromResponse } from '../services/scoring';
import { getAlertsFromResponse } from '../services/alert';
import { decryptData } from "../services/encryption";
import {
  activityTransformJson,
  itemTransformJson,
  itemAttachExtras,
  ORDER,
} from "./json-ld";
 
// Convert ids like "applet/some-id" to just "some-id"
const trimId = (typedId) => typedId.split("/").pop();

export const transformResponses = (responses) => R.unnest(responses);
export const getEncryptedData = (response, key) =>
  encryptData({ key, text: JSON.stringify(response) });

export const prepareResponseForUpload = (
  inProgressResponse,
  appletMetaData,
  responseHistory,
) => {
  const languageKey = "en";
  const { activity, responses, subjectId } = inProgressResponse;
  const appletVersion = activity.appletSchemaVersion[languageKey];
  let cumulative = responseHistory.tokens.cumulativeToken;

  const alerts = [];
  for (let i = 0; i < responses.length; i++) {
    const item = activity.items[i];

    if (item.valueConstraints) {
      const { valueType, responseAlert, enableNegativeTokens } = item.valueConstraints;

      if (responses[i] !== null && responses[i] !== undefined && responseAlert) {
        const messages = getAlertsFromResponse(item, responses[i].value ? responses[i].value : responses[i]);
        messages.forEach(msg => {
          alerts.push({
            id: activity.items[i].id.split('/')[1],
            schema: activity.items[i].schema,
            message: msg
          });
        })
      }

      if (
        valueType && 
        valueType.includes('token')
      ) {
        cumulative += (getValuesFromResponse(item, responses[i].value) || []).reduce(
          (cumulative, current) => {
            if (current >= 0 || enableNegativeTokens) {
              return cumulative + current;
            }
            return cumulative
          }, 0
        )
      }
    }
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
    client: {
      os: DeviceInfo.getSystemName(),
      osVersion: DeviceInfo.getSystemVersion(),
      deviceModel: DeviceInfo.getModel(),
      appId: "mindlogger-mobile",
      appVersion: packageJson.version,
      width: Dimensions.get("screen").width,
      height: Dimensions.get("screen").height,
    },
    languageCode: languageKey,
    alerts,
  };

  let subScaleResult = [];
  if (activity.subScales) {
    for (let subScale of activity.subScales) {
      subScaleResult.push(
        getScoreFromLookupTable(responses, subScale.jsExpression, activity.items, subScale['lookupTable'])
      );
    }
  }

  /** process for encrypting response */
  if (config.encryptResponse && appletMetaData.encryption) {
    const formattedResponses = activity.items.reduce(
      (accumulator, item, index) => ({ ...accumulator, [item.schema]: index }),
      {},
    );
    const dataSource = getEncryptedData(responses, appletMetaData.AESKey);

    responseData['responses'] = formattedResponses;
    responseData['dataSource'] = dataSource;

    if (activity.subScales) {
      responseData['subScaleSource'] = getEncryptedData(subScaleResult, appletMetaData.AESKey);
      responseData['subScales'] = activity.subScales.reduce((accumulator, subScale, index) => ({ ...accumulator, [subScale.variableName]: index}), {});
    }

    responseData['tokenCumulation'] = {
      value: cumulative
    };

    responseData['userPublicKey'] = appletMetaData.userPublicKey;
  } else {
    const formattedResponses = activity.items.reduce((accumulator, item, index) => {
      return {
        ...accumulator,
        [item.schema]: responses[index],
      };
    }, {});
    responseData['responses'] = formattedResponses;

    if (activity.subScales) {
      responseData['subScales'] = activity.subScales.reduce((accumulator, subScale, index) => {
        return {
          ...accumulator,
          [subScale.variableName]: subScaleScores[index],
        }
      });
    }

    responseData['tokenCumulation'] = {
      value: cumulative
    };
  }

  return responseData;
};

export const getTokenUpdateInfo = (
  offset,
  responseHistory,
  appletMetaData
) => {
  const cumulative = responseHistory.tokens.cumulativeToken + offset;

  if (config.encryptResponse && appletMetaData.encryption) {
    return {
      offset: getEncryptedData(
        {
          value: offset
        },
        appletMetaData.AESKey
      ),
      cumulative: {
        value: cumulative
      },
      userPublicKey: appletMetaData['userPublicKey']
    }      
  }

  return {
    offset: { value: offset },
    cumulative: { value: cumulative }
  }
};

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

  responses.tokens = responses.tokens || {};
  if (applet.encryption) {
    if (responses.tokens.cumulativeToken) {
      try {
        const cumulative = typeof responses.tokens.cumulativeToken.data !== 'object' ? JSON.parse(
          decryptData({
            key: applet.AESKey,
            text: responses.tokens.cumulativeToken.data,
          })
        ) : responses.tokens.cumulativeToken.data;

        responses.tokens.cumulativeToken = cumulative.value || 0;
      } catch {
        responses.tokens.cumulativeToken = 0;
      }
    } else {
      responses.tokens.cumulativeToken = 0;
    }

    responses.tokens.tokenUpdates = responses.tokens.tokenUpdates || [];
    responses.tokens.tokenUpdates.forEach(tokenUse => {
      try {
        const tokenUpdate = typeof tokenUse.data !== 'object' ? JSON.parse(
          decryptData({
            key: applet.AESKey,
            text: tokenUse.data,
          })
        ) : tokenUse.data;

        tokenUse.value = tokenUpdate.value || 0;
      } catch {
        tokenUse.value = 0;
      }
    })
  }
  
  /** replace response to plain format */
  if (responses.responses) {
    Object.keys(responses.responses).forEach((item) => {
      for (let response of responses.responses[item]) {
        if (
          response.value &&
          response.value.src &&
          response.value.ptr !== undefined
        ) {
          response.value =
            responses.dataSources[response.value.src][response.value.ptr];
          if (response.value && response.value.value) {
            response.value = response.value.value;
          }
        }
      }

      responses.responses[item] = responses.responses[item].filter(
        (response) => response.value
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

  if (responses.cumulatives) {
    Object.keys(responses.cumulatives).forEach((itemIRI) => {
      const cumulative = responses.cumulatives[itemIRI];
      if (
        cumulative.src &&
        cumulative.ptr !== undefined
      ) {
        cumulative.value = responses.dataSources[cumulative.src][cumulative.ptr];
      }

      const oldItem = responses.itemReferences[cumulative.version] && 
                      responses.itemReferences[cumulative.version][itemIRI];
      if ( oldItem ) {
        const currentActivity = applet.activities.find(activity => activity.id.split('/').pop() == oldItem.original.activityId)

        if (currentActivity) {
          const currentItem = activity.items.find(item => item.id.split('/').pop() === oldItem.original.screenId);

          if (currentItem && currentItem.schema !== itemIRI) {
            responses.cumulatives[currentItem.schema] = responses.cumulatives[itemIRI];

            delete responses.cumulatives[itemIRI];
          }
        }
      }
    })
  }
  return { ...responses };
}
