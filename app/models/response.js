import * as R from 'ramda';
import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import packageJson from '../../package.json';
import config from '../config';
import { encryptData } from '../services/encryption';
import { getScoreFromLookupTable, getValuesFromResponse } from '../services/scoring';

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
        alerts.push({
          id: activity.items[i].id.split('/')[1],
          schema: activity.items[i].schema
        });
      }

      if (
        valueType && 
        valueType.includes('token')
      ) {
        cumulative += (getValuesFromResponse(item, responses[i]) || []).reduce(
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

  let subScaleScores = [];
  if (activity.subScales) {
    for (let subScale of activity.subScales) {
      subScaleScores.push(
        getScoreFromLookupTable(responses, subScale.jsExpression, activity.items, subScale['lookupTable'])
      );
    }
  }

  /** process for encrypting response */
  if (config.encryptResponse && appletMetaData.encryption) {
    const formattedResponses = activity.items.reduce(
      (accumulator, item, index) => ({ ...accumulator, [item.schema]: responses[index] }),
      {},
    );
    const dataSource = getEncryptedData(responses, appletMetaData.AESKey);

    responseData['responses'] = formattedResponses;
    responseData['dataSource'] = dataSource;

    if (activity.subScales) {
      responseData['subScaleSource'] = getEncryptedData(subScaleScores, appletMetaData.AESKey);
      responseData['subScales'] = activity.subScales.reduce((accumulator, subScale, index) => ({ ...accumulator, [subScale.variableName]: index}), {});
    }

    responseData['tokenCumulation'] = getEncryptedData({
      value: cumulative
    }, appletMetaData.AESKey);

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
      cumulative: getEncryptedData(
        {
          value: cumulative
        },
        appletMetaData.AESKey
      ),
      userPublicKey: appletMetaData['userPublicKey']
    }      
  }

  return {
    offset: { value: offset },
    cumulative: { value: cumulative }
  }
};
