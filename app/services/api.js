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
import { decryptData } from "./encryption";
import {
  activityTransformJson,
  itemTransformJson,
  itemAttachExtras,
  ORDER,
} from "../models/json-ld";


export const downloadAppletResponse = async (authToken, applet) => {
  const currentResponses = await getData('ml_responses');
  const response = currentResponses ? currentResponses.find(r => applet.id === r.appletId) : null;
  const currentIndex = currentResponses ? currentResponses.findIndex(r => applet.id === r.appletId) : 0;
  const appletId = applet.id.split("/").pop();

  return getLast7DaysData({
    authToken,
    appletId,
    localItems: Object.keys(response.items),
    localActivities: Object.keys(response.activities),
    startDate: response ? response['schema:startDate'] : null,
    groupByDateActivity: false,
  }).then((responses) => {
    const appletId = applet.id;
    /** decrypt responses */
    if (responses.dataSources && applet.encryption) {
      Object.keys(responses.dataSources).forEach((key) => {
        try {
          responses.dataSources[key] = JSON.parse(
            decryptData({
              key: applet.AESKey,
              text: responses.dataSources[key],
            })
          );
        } catch {
          responses.dataSources[key] = {};
          responses.hasDecryptionError = true;
        }
      });
    }

    responses.tokens = responses.tokens || {};
    if (applet.encryption) {
      if (responses.tokens.cumulativeToken) {
        try {
          const cumulative = typeof responses.tokens.cumulativeToken.data !== 'object' ? JSON.parse(
            decryptData({
              key: applet.AESKey,
              text: responses.tokens.cumulativeToken.data,
            })
          ) : responses.tokens.cumulativeToken.data;

          responses.tokens.cumulativeToken = cumulative.value || 0;
        } catch {
          responses.tokens.cumulativeToken = 0;
        }
      } else {
        responses.tokens.cumulativeToken = 0;
      }

      responses.tokens.tokenUpdates = responses.tokens.tokenUpdates || [];
      responses.tokens.tokenUpdates.forEach(tokenUse => {
        try {
          const tokenUpdate = typeof tokenUse.data !== 'object' ? JSON.parse(
            decryptData({
              key: applet.AESKey,
              text: tokenUse.data,
            })
          ) : tokenUse.data;

          tokenUse.value = tokenUpdate.value || 0;
        } catch {
          tokenUse.value = 0;
        }
      })
    }

    /** replace response to plain format */
    if (responses.responses) {
      Object.keys(responses.responses).forEach((item) => {
        for (let response of responses.responses[item]) {
          if (
            response.value &&
            response.value.src &&
            response.value.ptr !== undefined
          ) {
            response.value =
              responses.dataSources[response.value.src][response.value.ptr];

            if (response.value && response.value.value) {
              response.value = response.value.value;
            }
          }
        }

        responses.responses[item] = responses.responses[item].filter(
          (response) => response.value
        );
        if (responses.responses[item].length === 0) {
          delete responses.responses[item];
        }
      });
    }

    if (responses.items) {
      for (let itemId in responses.items) {
        const item = responses.items[itemId];
        responses.items[itemId] = {
          ...itemAttachExtras(itemTransformJson(item), itemId),
          original: item.original,
          activityId: item.activityId,
        };
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
          original: activity.original,
        };
      }
    }

    if (responses.cumulatives) {
      Object.keys(responses.cumulatives).forEach((itemIRI) => {
        const cumulative = responses.cumulatives[itemIRI];
        if (
          cumulative.src &&
          cumulative.ptr !== undefined
        ) {
          cumulative.value = responses.dataSources[cumulative.src][cumulative.ptr];
        }

        const oldItem = responses.itemReferences[cumulative.version] &&
          responses.itemReferences[cumulative.version][itemIRI];
        if (oldItem) {
          const currentActivity = applet.activities.find(activity => activity.id.split('/').pop() == oldItem.original.activityId)

          if (currentActivity) {
            const currentItem = activity.items.find(item => item.id.split('/').pop() === oldItem.original.screenId);

            if (currentItem && currentItem.schema !== itemIRI) {
              responses.cumulatives[currentItem.schema] = responses.cumulatives[itemIRI];

              delete responses.cumulatives[itemIRI];
            }
          }
        }
      })
    }

    currentResponses[currentIndex] = { ...responses, appletId };
    return currentResponses;
  });
}

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
  const appletId = response.applet.id;
  const activityId = response.activity.id;

  // Each "response" has number of "answers", each of which may have a file
  // associated with it
  const uploadRequests = Object.keys(answers).reduce((accumulator, key) => {
    const answer = answers[key];

    // Surveys with a "uri" value and canvas with a "uri" will have files to upload
    let file;
    if (R.path(["survey", "uri"], answer)) {
      file = {
        key,
        uri: answer.survey.uri,
        filename: answer.survey.filename,
        type: "image/png",
      };
    } else if (R.path(["canvas", "uri"], answer)) {
      file = {
        key,
        uri: answer.canvas.uri,
        filename: answer.canvas.filename,
        type: "image/jpg",
      };
    } else if (answer && answer.uri && answer.filename) {
      file = {
        key,
        ...answer
      };
    } else if (answer && answer.lines && answer.svgString) {
      const filename = `${randomString({ length: 20 })}.svg`;
      file = {
        key,
        svgString: answer.svgString,
        filename,
        type: 'image/svg',
        uri: `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`,
      };
    } else {
      return accumulator; // Break early
    }
    const request = prepareFile(file)
      .then(file => postFile({
        authToken,
        file,
        parentType: 'item',
        parentId: item._id,
        appletId,
        activityId
      }))
      .then((res) => {
        try {
          /** delete file from local storage after uploading */
          RNFetchBlob.fs.unlink(file.uri.split("///").pop());
        } catch (error) { }
      }).catch((err) => {
        console.log('uploadFiles error', err.message, err);
      });

    return [...accumulator, request];
  }, []);
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
