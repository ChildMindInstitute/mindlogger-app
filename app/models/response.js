import * as R from 'ramda';
import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import packageJson from '../../package.json';
import config from '../config';
import { encryptData } from '../services/encryption';

// Convert ids like "applet/some-id" to just "some-id"
const trimId = typedId => typedId.split('/').pop();

export const transformResponses = responses => R.unnest(responses);
export const getEncryptedData = (response, key) => encryptData({ key, text: JSON.stringify(response) });

export const prepareResponseForUpload = (inProgressResponse, appletMetaData) => {
  const languageKey = 'en';
  const { activity, responses, subjectId } = inProgressResponse;

  const responseData = {
    activity: {
      id: trimId(activity.id),
      schema: activity.schema,
      schemaVersion: activity.schemaVersion[languageKey],
    },
    applet: {
      id: trimId(activity.appletId),
      schema: activity.appletSchema,
      schemaVersion: activity.appletSchemaVersion[languageKey],
    },
    subject: subjectId,
    responseStarted: inProgressResponse.timeStarted,
    responseCompleted: Date.now(),
    client: {
      os: DeviceInfo.getSystemName(),
      osVersion: DeviceInfo.getSystemVersion(),
      deviceModel: DeviceInfo.getModel(),
      appId: 'mindlogger-mobile',
      appVersion: packageJson.version,
      width: Dimensions.get('screen').width,
      height: Dimensions.get('screen').height,
    },
    languageCode: languageKey,
  };

  /** process for encrypting response */
  if (config.encryptResponse && appletMetaData.encryption) {
    const items = activity.items.reduce((accumulator, item, index) => ({ ...accumulator, [item.schema]: index }), {});
    const dataSource = getEncryptedData(responses, appletMetaData.AESKey);

    responseData['responses'] = items;
    responseData['dataSource'] = dataSource;
    responseData['userPublicKey'] = appletMetaData.userPublicKey;
  } else {
    const formattedResponses = activity.items.reduce((accumulator, item, index) => {
      return {
        ...accumulator,
        [item.schema]: responses[index],
      };
    }, {});
    responseData['responses'] = formattedResponses;
  }

  return responseData;
};
