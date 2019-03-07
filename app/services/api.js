import {
  getFolders,
  getItems,
  getCollection,
  getResponses,
} from './network';
import {
  transformResponses,
} from './transform';

const downloadActivity = async (authToken, activityId) => {
  const activityFolders = await getFolders(authToken, activityId, 'folder');
  const activityData = activityFolders.filter(folder => folder.meta.info !== true);
  const activityScreens = await getItems(authToken, activityData[0]._id);
  return {
    ...activityData[0],
    screens: activityScreens,
    info: activityFolders.filter(folder => folder.meta.info === true)[0] || {},
  };
};

const downloadActivities = async (authToken, activityList) => Promise.all(
  activityList.map(activity => downloadActivity(authToken, activity._id)),
);

const downloadApplet = async (authToken, appletId) => {
  // Each applet should have an "Info" and "Activities" folder, each containing activities
  const appletFolders = await getFolders(authToken, appletId, 'folder');
  if (appletFolders.length === 0) {
    throw new Error(`Applet ${appletId} has no folders`);
  }
  const infoFolder = appletFolders.filter(folder => folder.name === 'Info');
  const activitiesFolder = appletFolders.filter(folder => folder.name === 'Activities');

  // Then we have to drill into each folder to get a listing of activities
  const downloadFolders = await Promise.all([
    getFolders(authToken, infoFolder[0]._id, 'folder'),
    getFolders(authToken, activitiesFolder[0]._id, 'folder'),
  ]);

  // Finally we need to download all of those activities
  const activityData = await Promise.all([
    downloadActivities(authToken, downloadFolders[0]),
    downloadActivities(authToken, downloadFolders[1]),
  ]);

  return {
    info: activityData[0],
    activities: activityData[1],
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
