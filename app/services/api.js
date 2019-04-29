import * as R from 'ramda';
import RNFetchBlob from 'react-native-fetch-blob';
import {
  getFolders,
  getResponses,
  postFolder,
  postItem,
  postFile,
} from './network';
import {
  transformResponses,
} from './transform';

export const downloadAllResponses = (authToken, userId, applets, onProgress) => {
  let numDownloaded = 0;
  onProgress(numDownloaded, applets.length);
  const requests = applets.map(
    applet => getResponses(authToken, userId, applet._id).then((responses) => {
      numDownloaded += 1;
      onProgress(numDownloaded, applets.length);
      return responses;
    }),
  );
  return Promise.all(requests)
    .then(transformResponses);
};

const uploadFiles = (authToken, response, item) => {
  const answers = R.pathOr([], ['payload', 'responses'], response);

  // Each "response" has number of "answers", each of which may have a file
  // associated with it
  const uploadRequests = answers.reduce((accumulator, answer) => {
    const { data } = answer;

    // Surveys with a "uri" value and canvas with a "uri" will have files to upload
    let file;
    if (data && data.survey && data.survey.uri) {
      file = { uri: data.survey.uri, filename: data.survey.filename, type: 'application/octet' };
    } else if (data && data.canvas && data.canvas.uri) {
      file = { uri: data.canvas.uri, filename: data.canvas.filename, type: 'application/jpg' };
    } else if (data && data.uri && data.filename) {
      file = { uri: data.uri, filename: data.filename, type: 'application/octet' };
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
        parentType: item._modelType,
        parentId: item._id,
      }))
      .then(() => RNFetchBlob.fs.unlink(file.uri.replace('file://', ''))); // Delete file after upload

    return [...accumulator, request];
  }, []);

  return Promise.all(uploadRequests);
};

const uploadResponse = (authToken, response) => postFolder({
  authToken,
  folderName: response.appletName,
  parentId: response.responseCollectionId,
  reuseExisting: true,
}).then(folder => postItem({
  authToken,
  name: response.answerName,
  metadata: response.payload,
  folderId: folder._id,
})).then(item => uploadFiles(authToken, response, item));

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
    });
};

export const getResponseCollection = (authToken, userId) => getFolders(authToken, userId, 'user')
  .then((folders) => {
    if (folders.length > 0) {
      return folders[0];
    }
    console.log(authToken, userId);
    return postFolder({
      authToken,
      folderName: 'Responses',
      parentId: userId,
      parentType: 'user',
      reuseExisting: true,
    }).then((folder) => {
      console.log(folder);
      return folder;
    });
  })
  .then(folder => folder._id);
