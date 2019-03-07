import config from '../config';

const objectToQueryParams = obj => Object.keys(obj).reduce(
  (qs, key) => `${qs}&${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`,
  '',
);

export const get = (route, authToken, queryObj = {}) => {
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

export const getCollection = (authToken, collectionName) => get(
  'collection',
  authToken,
  { text: collectionName },
);

export const getFolders = (authToken, parentId, parentType = 'collection') => get(
  'folder',
  authToken,
  { parentId, parentType },
);

export const getItems = (authToken, folderId) => get(
  'item',
  authToken,
  { folderId },
);

export const getResponses = (authToken, userId, appletId) => get(
  'response',
  authToken,
  { userId, appletId },
);
