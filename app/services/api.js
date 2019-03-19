import * as R from 'ramda';
import RNFetchBlob from 'react-native-fetch-blob';
import {
  getFolders,
  getItems,
  getCollection,
  getResponses,
  postFolder,
  postItem,
  postFile,
} from './network';
import {
  transformResponses,
} from './transform';

const downloadActivity = async (authToken, activityId) => {
  const activityFolders = await getFolders(authToken, activityId, 'folder');
  const activityData = activityFolders.filter(folder => folder.meta.info !== true);
  const activityScreens = await getItems(authToken, activityData[0]._id);

  // Activities can also have info screens and we need to download the screens
  const info = activityFolders.filter(folder => folder.meta.info === true)[0] || undefined;
  if (info) {
    info.screens = await getItems(authToken, info._id);
  }

  return {
    ...activityData[0],
    screens: activityScreens,
    info,
  };
};

const downloadActivities = async (authToken, activityList) => Promise.all(
  activityList.map(activity => downloadActivity(authToken, activity._id)),
);

const downloadActivityFolder = (authToken, folderData) => {
  if (typeof folderData === 'undefined') {
    Promise.resolve([]);
  }
  return getFolders(authToken, folderData._id, 'folder')
    .then(folder => downloadActivities(authToken, folder));
};

const downloadApplet = async (authToken, appletId) => {
  // Each applet should have an "Info" and "Activities" folder, each containing activities
  const appletFolders = await getFolders(authToken, appletId, 'folder');
  if (appletFolders.length === 0) {
    throw new Error(`Applet ${appletId} has no folders`);
  }

  // Drill into the Info and Activities folders and download the contents
  const infoFolder = appletFolders.filter(folder => folder.name === 'Info')[0];
  const activitiesFolder = appletFolders.filter(folder => folder.name === 'Activities')[0];
  const [info, activities] = await Promise.all([
    downloadActivityFolder(authToken, infoFolder),
    downloadActivityFolder(authToken, activitiesFolder),
  ]);

  return {
    info: info.length > 0 ? info[0] : undefined,
    activities,
  };
};

export const downloadAllApplets = async (authToken, userId, onProgress) => {
  // Get all collections named "Volumes"
  const collections = await getCollection(authToken, 'Volumes');
  if (collections.length === 0) {
    throw new Error('No collection called Volumes');
  }

  // Get all folders under the Volumes collection (applets)
  const applets = await getFolders(authToken, collections[0]._id);
  if (applets.length === 0) {
    throw new Error('No applets found');
  }

  // Filter the volumes where the logged in user has "user" role
  const userApplets = applets.filter(
    v => v.meta && v.meta.members && v.meta.members.users.includes(userId),
  );
  if (userApplets.length === 0) {
    throw new Error('No user applets found');
  }

  // Download the user applets in secondary calls
  let numDownloaded = 0;
  onProgress(numDownloaded, userApplets.length);
  const promiseArr = userApplets.map(
    applet => downloadApplet(authToken, applet._id).then((downloaded) => {
      numDownloaded += 1;
      onProgress(numDownloaded, userApplets.length);
      return {
        ...applet,
        ...downloaded,
      };
    }),
  );

  try {
    const downloadedApplets = await Promise.all(promiseArr);
    return downloadedApplets;
  } catch (err) {
    throw err;
  }
};

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
  const uploadRequests = answers.reduce((acc, answer) => {
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
      return acc; // Break early
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
      }));

    return [...acc, request];
  }, []);

  return Promise.all(uploadRequests);
};

const uploadResponse = (authToken, response) => {
  return postFolder({
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
};

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
