import config from '../config';

const objectToQueryParams = obj => Object.keys(obj).reduce(
  (qs, key) => `${qs}&${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`,
  '',
);

const get = (route, authToken, queryObj = {}) => {
  const queryParams = objectToQueryParams(queryObj);
  const url = `${config.apiHost}/${route}?${queryParams}`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    mode: 'cors',
    headers,
  }).then(res => res.json());
};

const getCollection = (authToken, collectionName) => get(
  'collection',
  authToken,
  { text: collectionName },
);

const getFolders = (authToken, parentId, parentType = 'collection') => get(
  'folder',
  authToken,
  { parentId, parentType },
);

const downloadApplet = async (authToken, appletId) => {
  const appletFolders = await getFolders(authToken, appletId, 'folder');
  if (appletFolders.length === 0) {
    throw new Error(`Applet ${appletId} has no folders`);
  }
  const infoFolder = appletFolders.filter(folder => folder.name === 'Info');
  const activitiesFolder = appletFolders.filter(folder => folder.name === 'Activities');
  const downloadFolders = await Promise.all([
    getFolders(authToken, infoFolder[0]._id, 'folder'),
    getFolders(authToken, activitiesFolder[0]._id, 'folder'),
  ]);

  return {
    info: downloadFolders[0],
    activities: downloadFolders[1],
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
