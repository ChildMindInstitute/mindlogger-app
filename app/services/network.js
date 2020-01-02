import objectToFormData from 'object-to-formdata';
import RNFetchBlob from 'rn-fetch-blob';
import { getStore } from '../store';
// eslint-disable-next-line
import { btoa } from './helper';
import { apiHostSelector } from '../state/app/app.selectors';

const apiHost = () => {
  const state = getStore().getState(); // Get redux state
  return apiHostSelector(state);
};

const objectToQueryParams = obj => Object.keys(obj).map(
  key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`,
).join('&');

export const get = (route, authToken, queryObj = {}, extraHeaders = {}) => {
  const queryParams = queryObj
    ? `?${objectToQueryParams(queryObj)}`
    : '';

  const url = `${apiHost()}/${route}${queryParams}`;

  const headers = {
    ...extraHeaders,
  };
  if (authToken) {
    headers['Girder-Token'] = authToken;
  }

  return fetch(url, {
    mode: 'cors',
    headers,
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const postFormData = (route, authToken, body, extraHeaders = {}) => {
  const url = `${apiHost()}/${route}`;
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
  const url = `${apiHost()}/file?${queryParams}`;
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

export const getSkin = () => get(
  'context/skin',
  null,
  null,
);

export const getResponses = (authToken, applet) => get(
  'response',
  authToken,
  { applet },
);

export const getSchedule = (authToken, timezone) => get(
  'schedule',
  authToken,
  { timezone },
);

export const getApplets = authToken => get(
  'user/applets',
  authToken,
  { role: 'user' },
);

export const postResponse = ({ authToken, response }) => postFormData(
  `response/${response.applet.id}/${response.activity.id}`,
  authToken,
  {
    metadata: JSON.stringify(response),
  },
);

export const signIn = ({ user, password }) => get(
  'user/authentication',
  null,
  null,
  { 'Girder-Authorization': `Basic ${btoa(`${user}:${password}`)}` },
);

export const signOut = (authToken) => {
  const url = `${apiHost()}/user/authentication`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'delete',
    mode: 'cors',
    headers,
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const forgotPassword = (email) => {
  const queryParams = objectToQueryParams({ email });
  const url = `${apiHost()}/user/password/temporary?${queryParams}`;
  return fetch(url, {
    method: 'put',
    mode: 'cors',
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const signUp = (userData) => {
  const url = `${apiHost()}/user`;
  return fetch(url, {
    method: 'post',
    mode: 'cors',
    body: objectToFormData(userData),
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const updateUserDetails = (authToken, { id, firstName, lastName, email }) => {
  const url = `${apiHost()}/user/${id}`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'put',
    mode: 'cors',
    headers,
    body: objectToFormData({
      firstName,
      lastName,
      email,
    }),
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const updatePassword = (authToken, oldPassword, newPassword) => {
  const url = `${apiHost()}/user/password`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'put',
    mode: 'cors',
    headers,
    body: objectToFormData({
      old: oldPassword,
      new: newPassword,
    }),
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const fileLink = (file, token) => (file
  ? `${apiHost()}/${file['@id']}/download?contentDisposition=inline&token=${token}`
  : '');

export const registerOpenApplet = (authToken, schemaURI) => {
  const url = `${apiHost()}/applet/invite`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'post',
    mode: 'cors',
    headers,
    body: objectToFormData({ url: schemaURI }),
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const getAppletInvites = (authToken) => {
  const url = `${apiHost()}/user/invites`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'get',
    mode: 'cors',
    headers,
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const acceptAppletInvite = (authToken, id) => {
  const url = `${apiHost()}/group/${id}/member`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'post',
    mode: 'cors',
    headers,
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const declineAppletInvite = (authToken, id) => {
  const url = `${apiHost()}/group/${id}/member`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'delete',
    mode: 'cors',
    headers,
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const removeApplet = (authToken, groupId) => {
  const del = false;
  const url = `${apiHost()}/group/${groupId}/member?delete=${del}`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'delete',
    mode: 'cors',
    headers,
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const deleteApplet = (authToken, groupId) => {
  const del = true;
  const url = `${apiHost()}/group/${groupId}/member?delete=${del}`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'delete',
    mode: 'cors',
    headers,
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const deleteUserAccount = (authToken, userId) => {
  const url = `${apiHost()}/user/${userId}`;
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'delete',
    mode: 'cors',
    headers,
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const getLast7DaysData = ({ authToken, appletId, referenceDate }) => {
  let url = `${apiHost()}/response/last7Days/${appletId}`;
  if (referenceDate) {
    url += `?referenceDate=${referenceDate}`;
  }
  const headers = {
    'Girder-Token': authToken,
  };
  return fetch(url, {
    method: 'get',
    mode: 'cors',
    headers,
  }).then(res => (res.status === 200 ? res.json() : res)); // Promise.reject(res)));
};
