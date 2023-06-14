import * as R from "ramda";
import RNFetchBlob from "rn-fetch-blob";
import {
  getLast7DaysData,
  postResponse,
  postFile,
  downloadTokenResponses,
  checkIfFilesExist,
  checkIfResponseExists
} from "./network";
import { getData } from "./storage";
import { transformResponses, decryptAppletResponses } from "../models/response";
import { decryptData } from "./encryption";

export const downloadAppletResponse = async (authToken, applet) => {
  const currentResponses = await getData('ml_responses');
  const response = currentResponses ? currentResponses.find(r => applet.id === r.appletId) : null;
  const currentIndex = currentResponses ? currentResponses.findIndex(r => applet.id === r.appletId) : 0;
  const appletId = applet.id.split("/").pop();

  return getLast7DaysData({
    authToken,
    appletId,
    localItems: response ? Object.keys(response.items) : null,
    localActivities: response ? Object.keys(response.activities) : null,
    startDate: response ? response['schema:startDate'] : null,
    groupByDateActivity: false,
  }).then((responses) => {
    const appletId = applet.id;

    currentResponses[currentIndex] = {
      ...decryptAppletResponses(applet, responses),
      appletId
    };

    return currentResponses;
  });
}

export const getTokenResponses = (authToken, applet, startDate=null) => {
  const appletId = applet.id.split('/').pop();

  return downloadTokenResponses(authToken, appletId, startDate ? startDate.toISOString() : null).then(token => {
    for (const key of ['tokens', 'trackers', 'trackerAggregation']) {
      token[key].forEach(change => {
        try {
          const data = typeof change.data !== 'object' ? JSON.parse(
            decryptData({
              key: applet.AESKey,
              text: change.data,
            })
          ) : change.data;

          change.data = data;
        } catch {
          change.data = []
        }
      })
    }

    token.trackers = token.trackers.filter(tracker => !Array.isArray(tracker.data) || tracker.data.length)
    token.trackerAggregation = token.trackerAggregation.filter(tracker => !Array.isArray(tracker.data) || tracker.data.length)

    return token;
  })
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
  if (file.size) {
    return Promise.resolve(file);
  }

  if (file.svgString && file.uri) {
    return RNFetchBlob.fs
      .writeFile(file.uri, file.svgString)
      .then(() => {
        return Promise.resolve(file);
      })
      .then((file) => RNFetchBlob.fs.stat(file.uri))
      .then((fileInfo) => Promise.resolve({ ...file, size: fileInfo.size }));
  }

  return RNFetchBlob.fs
    .stat(file.uri)
    .then((fileInfo) => Promise.resolve({ ...file, size: fileInfo.size }));
};

const buildFileDescriptions = (answers, responseStartedAt) => {
  return Object.keys(answers).reduce((accumulator, activityWithItemIds) => {
    const key = activityWithItemIds;
    const answer = answers[key];
    const fileId = `${key.split("/").pop()}_${responseStartedAt}`;

    let file;
    if (answer?.survey?.uri) {
      file = {
        uri: answer.survey.uri,
        filename: answer.survey.filename,
        type: "image/png",
      };
    } else if (answer?.canvas?.uri) {
      file = {
        uri: answer.canvas.uri,
        filename: answer.canvas.filename,
        type: "image/jpg",
      };
    } else if (answer && answer.uri && answer.filename) {
      file = { ...answer };
    } else if (answer && answer.lines && answer.svgString) {
      file = {
        svgString: answer.svgString,
        filename: `${fileId}.svg`,
        type: "image/svg",
        uri: `${RNFetchBlob.fs.dirs.DocumentDir}/${fileId}`,
      };
    }

    if (file) {
      file.fileId = `${key.split("/").pop()}_${responseStartedAt}`;
      file.key = key;
      accumulator.push(file);
    }

    return accumulator;
  }, []);
};

const uploadFileWithExistenceCheck = async ({
  file,
  checkResults,
  authToken,
  appletId,
  activityId,
  appletVersion,
}) => {
  const successResult = { uploaded: true, fileId: file.fileId };
  const errorResult = { uploaded: false, fileId: file.fileId };

  const checkResult = checkResults.find((x) => x.fileId === file.fileId);

  if (!checkResult) {
    console.warn("[uploadFileWithExistenceCheck]: checkResult not found")
    return errorResult;
  }

  if (checkResult.exists) {
    return successResult;
  }

  try {
    const preparedFile = await prepareFile(file);

    await postFile({
      authToken,
      file: preparedFile,
      appletId,
      activityId,
      appletVersion,
    });

    return successResult;
  } catch (error) {
    console.warn(
      "[uploadFileWithExistenceCheck.prepareFile|postFile]: File prepare or upload error occurred.\n\n",
      error
    );
    return errorResult;
  }
};

const uploadFiles = async (authToken, response) => {
  let fileDescriptions = null;

  try {
    fileDescriptions = await buildFileDescriptions(
      response?.responses ?? [],
      response.responseStarted
    );
  } catch (error) {
    console.warn(
      "[uploadFiles.buildFileDescriptions]: Error occurred while build file descriptions\n\n",
      error
    );
    return false;
  }

  if (!fileDescriptions.length) {
    return true;
  }

  const appletId = response.applet.id;
  const activityId = response.activity.id;

  let checkResults;

  try {
    checkResults = await checkIfFilesExist(
      appletId,
      authToken,
      fileDescriptions.map((x) => x.fileId)
    );
  } catch (error) {
    console.warn(
      "[uploadFiles.checkIfFilesExist]: Error occurred while 1nd check if files uploaded\n\n",
      error
    );
    return false;
  }

  const uploadingFiles = fileDescriptions.map(async (file) => {
    await uploadFileWithExistenceCheck({
      activityId,
      appletId,
      authToken,
      checkResults,
      file,
      appletVersion: response.applet.schemaVersion,
    });
  });

  await Promise.all(uploadingFiles);

  try {
    checkResults = await checkIfFilesExist(
      appletId,
      authToken,
      fileDescriptions.map((x) => x.fileId)
    );
  } catch (error) {
    console.warn(
      "[uploadFiles.checkIfFilesExist]: Error occurred while 2nd check if files uploaded\n\n",
      error
    );
    return false;
  }

  if (checkResults.length !== fileDescriptions.length) {
    console.warn("[uploadFiles]: Some check results weren't received from server")
    return false;
  }

  for (let checkResult of checkResults) {
    const { fileId, exists } = checkResult;
    const file = fileDescriptions.find((x) => x.fileId === fileId);

    if (exists) {
      try {
        await RNFetchBlob.fs.unlink(file.uri.split("///").pop());
      } catch (error) {
        console.warn(
          "[uploadFiles.RNFetchBlob.fs.unlink]: File clean up error\n\n",
          error
        );
      }
    }
  }

  return checkResults.every((x) => x.exists);
};

const uploadAnswers = async (authToken, response) => {
  const { responseStarted, activity, applet } = response;

  let responseExist;

  try {
    responseExist = await checkIfResponseExists(
      applet.id,
      authToken,
      activity.id,
      responseStarted
    );
    if (responseExist === undefined) {
      throw new Error('[uploadAnswers]: responseExist is undefined');
    }
  } catch (error) {
    console.warn(
      "[uploadAnswers]: Error occurred while 1st check if response exists",
      error
    );
    return false;
  }

  if (responseExist) {
    return true;
  }

  try {
    await postResponse({
      authToken,
      response,
    });
  } catch (error) {
    console.warn("[postResponse]: Error occurred while response upload");
  }

  try {
    responseExist = await checkIfResponseExists(
      applet.id,
      authToken,
      activity.id,
      responseStarted
    );
    if (responseExist === undefined) {
      throw new Error('[uploadAnswers]: responseExist is undefined');
    }
    return responseExist;
  } catch (error) {
    console.warn(
      "[uploadAnswers]: Error occurred while 2nd check if response exists",
      error
    );
    return false;
  }
}; 

export const uploadResponseQueue = async (
  authToken,
  getQueue,
  shiftQueue,
  incrementUploadAttempts
) => {  
  let queue = getQueue();
  const length = queue.length;

  for (let i = 0; i < length; i++) {
    const response = queue[0];

    try {
      const answersUploaded = await uploadAnswers(authToken, response);
      
      if (!answersUploaded) {
        incrementUploadAttempts();
        return false;
      }

      const filesUploaded = await uploadFiles(
        authToken,
        response,
      );
      
      if (!filesUploaded) {
        incrementUploadAttempts();
        return false;
      }

      shiftQueue();
    } catch (error) {
      console.warn("[uploadResponseQueue]: Upload error occurred", error);
      incrementUploadAttempts();
      return false;
    } finally {
      queue = getQueue();
    }
  }
  
  return true;
};
