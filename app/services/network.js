import objectToFormData from 'object-to-formdata';
import RNFetchBlob from 'react-native-fetch-blob';
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
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const postFormData = (route, authToken, body, extraHeaders = {}) => {
  const url = `${config.apiHost}/${route}`;
  const headers = {
    'Girder-Token': authToken,
    ...extraHeaders,
  };
  return fetch(url, {
    method: 'post',
    mode: 'cors',
    headers,
    body: objectToFormData(body),
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const postFile = ({ authToken, file, parentType, parentId }) => {
  const queryParams = objectToQueryParams({
    parentType,
    parentId,
    name: file.filename,
    size: file.size,
  });
  const url = `${config.apiHost}/file?${queryParams}`;
  const headers = {
    'Girder-Token': authToken,
    'Content-Type': file.type,
  };

  return RNFetchBlob.fetch(
    'POST',
    url,
    headers,
    RNFetchBlob.wrap(file.uri),
  ).then(res => (res.info().status === 200 ? res.json() : Promise.reject(res)));
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

export const postFolder = ({
  authToken,
  folderName,
  parentId,
  metadata = {},
  parentType = 'folder',
  reuseExisting = true,
}) => postFormData(
  'folder',
  authToken,
  {
    parentId,
    name: folderName,
    metadata: JSON.stringify(metadata),
    parentType,
    reuseExisting,
  },
);

export const postItem = ({ authToken, folderId, name, metadata = {} }) => postFormData(
  'item',
  authToken,
  {
    folderId,
    name,
    metadata: JSON.stringify(metadata),
  },
);
