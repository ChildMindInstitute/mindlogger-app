import { createSelector } from 'reselect';
import * as R from 'ramda';

export const responsesSelector = R.path(['responses', 'responseHistory']);

export const uploadQueueSelector = R.path(['responses', 'uploadQueue']);

export const isDownloadingResponsesSelector = R.path(['responses', 'isDownloadingResponses']);

export const downloadProgressSelector = R.path(['responses', 'downloadProgress']);

export const currentActivityIdSelector = R.path(['responses', 'currentActivity']);

export const inProgressSelector = R.path(['responses', 'inProgress']);

// Flatten the response history so that keys are activity ids
export const responsesGroupedByActivitySelector = createSelector(
  responsesSelector,
  (appletResponses) => {
    const acc = {};
    Object.keys(appletResponses).forEach((appletId) => {
      const responseAr = appletResponses[appletId];
      responseAr.forEach((response) => {
        // If meta is not set, ignore the response
        if (typeof response.meta === 'undefined') {
          return;
        }

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

export const currentResponsesSelector = createSelector(
  currentActivityIdSelector,
  inProgressSelector,
  (activityId, inProgress) => inProgress[activityId],
);
