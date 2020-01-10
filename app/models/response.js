import * as R from 'ramda';
import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import packageJson from '../../package.json';

// Convert ids like "applet/some-id" to just "some-id"
const trimId = typedId => typedId.split('/').pop();

export const transformResponses = responses => R.unnest(responses);

export const prepareResponseForUpload = (inProgressResponse) => {
  const languageKey = 'en';
  const { activity, responses, subjectId } = inProgressResponse;

  const formattedResponses = activity.items.reduce((accumulator, item, index) => {
    return {
      ...accumulator,
      [item.schema]: responses[index],
    };
  }, {});

  return {
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
    responses: formattedResponses,
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
};
