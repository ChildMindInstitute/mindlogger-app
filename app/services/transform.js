import moment from 'moment';
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

export const prepareResponseForUpload = (activity, response) => {
  // To do: replace these
  const { act, actOptions} = this.props;

  const answerName = moment().format('YYYY-M-D') + ' ' + act.name;
  const payload = {
    ...actOptions,
    activity: {
      "@id": `folder/${act._id}`,
      name: act.name
    },
    "devices:os": `devices:${DeviceInfo.getSystemName()}`,
    "devices:osversion": DeviceInfo.getSystemVersion(),
    "deviceModel": DeviceInfo.getModel(),
    "appVersion": packageJson.name + packageJson.version,
    responses: answers,
    responseTime: Date.now()
  };
  return {
    answerName,
    payload,
  };
};