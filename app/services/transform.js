import moment from 'moment';
import * as R from 'ramda';
import DeviceInfo from 'react-native-device-info';
import packageJson from '../../package.json';

export const transformResponses = (responsesAr) => {
  const flattened = responsesAr.reduce(
    (acc, item) => {
      const key = Object.keys(item)[0];
      return {
        ...acc,
        [key]: item[key],
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

export const prepareAnswerForUpload = (screen, answer) => ({
  '@id': screen._id,
  data: answer,
  text: screen.meta.text,
});

export const prepareResponseForUpload = (activity, answers, responseCollectionId) => {
  const dateString = moment().format('YYYY-M-D');
  const answerName = `${dateString} ${activity.name}`;

  // Each answer needs some additional metadata attached to it
  const preparedAnswers = answers.map(
    (answer, index) => prepareAnswerForUpload(activity.screens[index], answer),
  );

  const activityOptions = R.pathOr({}, ['meta', 'options'], activity);

  const payload = {
    ...activityOptions,
    activity: {
      '@id': `folder/${activity._id}`,
      name: activity.name,
    },
    'devices:os': `devices:${DeviceInfo.getSystemName()}`,
    'devices:osversion': DeviceInfo.getSystemVersion(),
    deviceModel: DeviceInfo.getModel(),
    appVersion: packageJson.name + packageJson.version,
    responses: preparedAnswers,
    responseTime: Date.now(),
  };
  return {
    answerName,
    responseCollectionId,
    appletName: activity.appletName,
    payload,
  };
};
