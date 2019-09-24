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

export const downloadAllResponses = (authToken, applets, onProgress) => {
  let numDownloaded = 0;
  onProgress(numDownloaded, applets.length);
  const requests = applets.map((applet) => {
    const appletId = applet.id.split('/').pop();
    return getLast7DaysData({ authToken, appletId }).then((responses) => {
      numDownloaded += 1;
      onProgress(numDownloaded, applets.length);
      return responses;
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
