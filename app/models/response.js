import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import packageJson from '../../package.json';

// Convert ids like "applet/some-id" to just "some-id"
const trimId = typedId => typedId.split('/').pop();

export const transformResponses = (responsesAr) => {
  const flattened = responsesAr.reduce(
    (acc, item) => {
      const keys = Object.keys(item);
      if (keys.length === 0) {
        return acc;
      }
      return {
        ...acc,
        [keys[0]]: item[keys[0]],
      };
    },
    {},
  );

  // Add timestamp to each response
  Object.keys(flattened).forEach(
    key => flattened[key].forEach((response) => {
      response.createdTimestamp = moment(response.created).valueOf();
    }),
  );

  return flattened;
};

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
    },
    languageCode: languageKey,
  };
};
