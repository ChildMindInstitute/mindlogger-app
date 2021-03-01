import * as R from "ramda";
import RNFetchBlob from "rn-fetch-blob";
import randomString from "random-string";
import {
  // getResponses,
  getLast7DaysData,
  postResponse,
  postFile,
} from "./network";
import { getData } from "./asyncStorage";
import { cleanFiles } from "./file";
import { transformResponses, decryptAppletResponses } from "../models/response";

export const downloadAllResponses = async (authToken, applets, onProgress) => {
  const currentResponses = await getData('ml_responses');
  let numDownloaded = 0;

  onProgress(numDownloaded, applets.length);
  const requests = applets.map((applet) => {
    const response = currentResponses ? currentResponses.find(r => applet.id === r.appletId) : null;
    const appletId = applet.id.split("/").pop();
    return getLast7DaysData({
      authToken,
      appletId,
      localItems: response ? Object.keys(response.items) : null,
      localActivities: response ? Object.keys(response.activities) : null,
      startDate: response ? response['schema:startDate'] : null,
      groupByDateActivity: false,
    }).then((responses) => {
      numDownloaded += 1;
      onProgress(numDownloaded, applets.length);
      /** decrypt responses */
      return {
        ...decryptAppletResponses(applet, responses),
        appletId: applet.id
      };
    });
  });
  return Promise.all(requests).then(transformResponses);
};

const prepareFile = (file) => {
  if (file.svgString && file.uri) {
    return RNFetchBlob.fs.writeFile(file.uri, file.svgString)
      .then((result) => {
        return Promise.resolve(file);
      }).then(file => RNFetchBlob.fs.stat(file.uri))
      .then(fileInfo => Promise.resolve({ ...file, size: fileInfo.size }));
  }
  if (file.size) {
    return Promise.resolve(file);
  }
  return RNFetchBlob.fs.stat(file.uri)
    .then(fileInfo => Promise.resolve({ ...file, size: fileInfo.size }));
};

const uploadFiles = (authToken, response, item) => {
  const answers = R.pathOr([], ["responses"], response);
  // Each "response" has number of "answers", each of which may have a file
  // associated with it
  const uploadRequests = Object.keys(answers).reduce((accumulator, key) => {
    const answer = answers[key];
    // Surveys with a "uri" value and canvas with a "uri" will have files to upload
    let file;
    if (R.path(["survey", "uri"], answer)) {
      file = {
        uri: answer.survey.uri,
        filename: answer.survey.filename,
        type: "application/octet",
      };
    } else if (R.path(["canvas", "uri"], answer)) {
      file = {
        uri: answer.canvas.uri,
        filename: answer.canvas.filename,
        type: "application/jpg",
      };
    } else if (answer && answer.uri && answer.filename) {
      file = {
        uri: answer.uri,
        filename: answer.filename,
        size: answer.size,
        type: 'application/octet',
      };
    } else if (answer && answer.lines && answer.svgString) {
      const filename = `${randomString({ length: 20 })}.svg`;
      file = {
        svgString: answer.svgString,
        filename,
        type: 'application/svg',
        uri: `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`,
      };
    } else {
      return accumulator; // Break early
    }
    console.log('uploadFiles, file', { file, answer });

    const request = prepareFile(file)
      .then(file => postFile({
        authToken,
        file,
        parentType: 'item',
        parentId: item._id,
      }))
      .then((res) => {
        console.log('uploadFiles, response:', { res });
        /** delete file from local storage after uploading */
        RNFetchBlob.fs.unlink(file.uri.split("///").pop());
      }).catch((err) => {
        console.log('uploadFiles error', err.message, { err });
      });

    console.log('uploadFiles, request', { request });

    return [...accumulator, request];
  }, []);
  console.log('uploadFiles uploadRequests', { uploadRequests });
  return Promise.all(uploadRequests);
};

const uploadResponse = (authToken, response) =>
  postResponse({
    authToken,
    response,
  })
    .then((item) => uploadFiles(authToken, response, item))
    .then(() => {
      const responses = R.pathOr([], ["payload", "responses"], response);
      console.log({ apiRes: responses });
      console.log({ resss: response });
      cleanFiles(responses);
    });

// Recursive function that tries to upload the first item in the queue and
// calls itself again on success
export const uploadResponseQueue = (
  authToken,
  responseQueue,
  progressCallback,
) => {
  if (responseQueue.length === 0) {
    return Promise.resolve();
  }
  console.log('uploadResponseQueue', { authToken, responseQueueItem: responseQueue[0] });
  return uploadResponse(authToken, responseQueue[0])
    .then(() => {
      progressCallback();
      return uploadResponseQueue(
        authToken,
        R.remove(0, 1, responseQueue),
        progressCallback,
      );
    })
    .catch((e) => console.warn(e));
};
