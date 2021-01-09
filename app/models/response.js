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
  const cumulatives = { ...(responseHistory.cumulatives || {}) };
  let additionalTokens = 0;

  for (let i = 0; i < responses.length; i++) {
    const item = activity.items[i];

    if (item.valueConstraints) {
      const { valueType } = item.valueConstraints;

      if (
        valueType && 
        valueType.includes('token')
      ) {
        cumulatives[item.schema] = {
          value: (getValuesFromResponse(item, responses[i]) || []).reduce(
            (cumulative, current) => {
              if (current >= 0) {
                additionalTokens += current;
                return cumulative + current;
              }
              cumulative;
            }, responseHistory.cumulatives && responseHistory.cumulatives[item.schema] && responseHistory.cumulatives[item.schema].value || 0
          ),
          version: appletVersion,
        }
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
      (accumulator, item, index) => ({ ...accumulator, [item.schema]: index }),
      {},
    );
    const dataSource = getEncryptedData(responses, appletMetaData.AESKey);

    responseData['responses'] = formattedResponses;
    responseData['dataSource'] = dataSource;

    if (activity.subScales) {
      responseData['subScaleSource'] = getEncryptedData(subScaleScores, appletMetaData.AESKey);
      responseData['subScales'] = activity.subScales.reduce((accumulator, subScale, index) => ({ ...accumulator, [subScale.variableName]: index}), {});
    }

    responseData['tokenCumulationSource'] = getEncryptedData(Object.values(cumulatives).map(cumulative => cumulative.value), appletMetaData.AESKey);
    responseData['tokenCumulations'] = Object.keys(cumulatives).reduce((accumulator, itemIRI, index) => ({
      ...accumulator,
      [itemIRI]: {
        ptr: index,
        version: cumulatives[itemIRI].version,
      }
    }), {});

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

    responseData['tokenCumulations'] = cumulatives;
  }

  return {
    responseData,
    additionalTokens
  };
};
