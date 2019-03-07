import { createSelector } from 'reselect';
import * as R from 'ramda';

export const responsesSelector = R.path(['responses', 'responseHistory']);

export const isDownloadingResponsesSelector = R.path(['responses', 'isDownloadingResponses']);

export const downloadProgressSelector = R.path(['responses', 'downloadProgress']);

// Flatten the response history so that keys are activity ids
export const responsesGroupedByActivitySelector = createSelector(
  responsesSelector,
  (appletResponses) => {
    const acc = {};
    Object.keys(appletResponses).forEach((appletId) => {
      const responseAr = appletResponses[appletId];
      responseAr.forEach((response) => {
        const activityIdWithType = response.meta.activity['@id'];
        const activityId = activityIdWithType.split('/')[1];
        if (typeof acc[activityId] === 'undefined') {
          acc[activityId] = [];
        }
        acc[activityId].push(response);
      });
    });
    return acc;
  },
);
