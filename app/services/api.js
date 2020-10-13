import * as R from 'ramda';
import RNFetchBlob from 'rn-fetch-blob';
import {
  // getResponses,
  getLast7DaysData,
  postResponse,
  postFile,
} from './network';
import { cleanFiles } from './file';
import { transformResponses } from '../models/response';
import { decryptData } from './encryption';
import { activityTransformJson, itemTransformJson, itemAttachExtras, ORDER } from '../models/json-ld';

export const downloadAllResponses = (authToken, applets, onProgress) => {
  let numDownloaded = 0;
  onProgress(numDownloaded, applets.length);
  const requests = applets.map((applet) => {
    const appletId = applet.id.split('/').pop();
    return getLast7DaysData({ authToken, appletId }).then((responses) => {
      numDownloaded += 1;
      onProgress(numDownloaded, applets.length);
      const appletId = applet.id;

      /** decrypt responses */
      if (responses.dataSources && applet.encryption) {
        Object.keys(responses.dataSources).forEach(key => {
          try {
            responses.dataSources[key] = JSON.parse(decryptData({ key: applet.AESKey, text: responses.dataSources[key] }));
          } catch {
            responses.dataSources[key] = {};
            responses.hasDecryptionError = true;
          }
        });
      }

      /** replace response to plain format */
      if (responses.responses) {
        Object.keys(responses.responses).forEach(item => {
          for (let response of responses.responses[item]) {
            if (response.value && response.value.src && response.value.ptr !== undefined) {
              response.value = responses.dataSources[response.value.src][response.value.ptr];
            }
          }

          responses.responses[item] = responses.responses[item].filter((response) => response.value);
          if (responses.responses[item].length === 0) {
            delete responses.responses[item];
          }
        })
      }

      if (responses.items) {
        for (let itemId in responses.items) {
          const item = responses.items[itemId];
          responses.items[itemId] = {
            ...itemAttachExtras(itemTransformJson(item), itemId),
            original: item.original,
            activityId: item.activityId
          }
        }
      }

      if (responses.itemReferences) {
        for (let version in responses.itemReferences) {
          for (let itemId in responses.itemReferences[version]) {
            const id = responses.itemReferences[version][itemId];
            if (id) {
              const item = responses.items[id];
              responses.itemReferences[version][itemId] = item;
            }
          }
        }
      }

      if (responses.activities) {
        for (let activityId in responses.activities) {
          const activity = responses.activities[activityId];
          if (activity[ORDER]) {
              delete activity[ORDER];
          }

          responses.activities[activityId] = {
            ...activityTransformJson(activity, []),
            original: activity.original
          }
        }
      }

      return { ...responses, appletId };
    });
  });
  return Promise.all(requests)
    .then(transformResponses);
};

const uploadFiles = (authToken, response, item) => {
  const answers = R.pathOr([], ['responses'], response);

  // Each "response" has number of "answers", each of which may have a file
  // associated with it
  const uploadRequests = Object.keys(answers).reduce((accumulator, key) => {
    const answer = answers[key];

    // Surveys with a "uri" value and canvas with a "uri" will have files to upload
    let file;
    if (R.path(['survey', 'uri'], answer)) {
      file = { uri: answer.survey.uri, filename: answer.survey.filename, type: 'application/octet' };
    } else if (R.path(['canvas', 'uri'], answer)) {
      file = { uri: answer.canvas.uri, filename: answer.canvas.filename, type: 'application/jpg' };
    } else if (answer && answer.uri && answer.filename) {
      file = { uri: answer.uri, filename: answer.filename, type: 'application/octet' };
    } else {
      return accumulator; // Break early
    }

    const request = RNFetchBlob.fs.stat(file.uri)
      .then(fileInfo => postFile({
        authToken,
        file: {
          ...file,
          size: fileInfo.size,
        },
        parentType: 'item',
        parentId: item._id,
      }));

    return [...accumulator, request];
  }, []);

  return Promise.all(uploadRequests);
};

const uploadResponse = (authToken, response) => postResponse({
  authToken,
  response,
}).then(item => uploadFiles(authToken, response, item))
  .then(() => {
    const responses = R.pathOr([], ['payload', 'responses'], response);
    cleanFiles(responses);
  });

// Recursive function that tries to upload the first item in the queue and
// calls itself again on success
export const uploadResponseQueue = (authToken, responseQueue, progressCallback) => {
  if (responseQueue.length === 0) {
    return Promise.resolve();
  }
  return uploadResponse(authToken, responseQueue[0])
    .then(() => {
      progressCallback();
      return uploadResponseQueue(authToken, R.remove(0, 1, responseQueue), progressCallback);
    })
    .catch(e => console.warn(e));
};
