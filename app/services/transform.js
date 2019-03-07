import moment from 'moment';

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
