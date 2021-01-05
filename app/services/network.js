import objectToFormData from "object-to-formdata";
import RNFetchBlob from "rn-fetch-blob";
import { getStore } from "../store";
// eslint-disable-next-line
import { btoa } from "./helper";
import { apiHostSelector } from "../state/app/app.selectors";

const apiHost = () => {
  const state = getStore().getState(); // Get redux state
  return apiHostSelector(state);
};

const objectToQueryParams = (obj) =>
  Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");

export const get = (route, authToken, queryObj = {}, extraHeaders = {}) => {
  const queryParams = queryObj ? `?${objectToQueryParams(queryObj)}` : "";

  const url = `${apiHost()}/${route}${queryParams}`;

  const headers = {
    ...extraHeaders,
  };
  if (authToken) {
    headers["Girder-Token"] = authToken;
  }

  return fetch(url, {
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const postFormData = (route, authToken, body, extraHeaders = {}) => {
  const url = `${apiHost()}/${route}`;
  const headers = {
    "Girder-Token": authToken,
    ...extraHeaders,
  };
  return fetch(url, {
    method: "post",
    mode: "cors",
    headers,
    body: objectToFormData(body),
  }).then((res) => {
    console.log({ res });
    return res.status === 200 ? res.json() : Promise.reject(res);
  });
};

export const postFile = ({ authToken, file, parentType, parentId }) => {
  console.log('postFile', { file, parentType, parentId });
  const queryParams = objectToQueryParams({
    parentType,
    parentId,
    name: file.filename,
    size: file.size,
  });
  const url = `${apiHost()}/file?${queryParams}`;
  const headers = {
    "Girder-Token": authToken,
    "Content-Type": file.type,
  };
  console.log('postFile', { queryParams, url, headers });
  return RNFetchBlob.fetch(
    "POST",
    url,
    headers,
    RNFetchBlob.wrap(file.uri),
  ).then((res) => {
    const responseInfo = res.info();
    console.log('postFile response', { res, responseInfo });
    return responseInfo.status === 200 ? res.json() : Promise.reject(res);
  });
};

export const getSkin = () => get("context/skin", null, null);

export const getResponses = (authToken, applet) =>
  get("response", authToken, { applet });

export const getSchedule = (authToken, timezone) =>
  get("schedule", authToken, { timezone });

export const getApplets = (authToken) =>
  get("user/applets", authToken, {
    role: "user",
    getAllApplets: true,
    retrieveSchedule: true,
    retrieveAllEvents: false,
    numberOfDays: 7,
  });

// export const getTargetApplet = (authToken, appletId) => get(
//   `applet/${appletId}`,
//   authToken,
//   { retrieveSchedule: true, retrieveAllEvents: true, retrieveItems: true },
// );

export const getTargetApplet = (authToken, appletId) =>
  get(`user/applet/${appletId}`, authToken, {
    retrieveSchedule: true,
    role: "user",
    getAllApplets: true,
  });

export const postResponse = ({ authToken, response }) => {
  console.log({ uploadRes: response });

  return postFormData(
    `response/${response.applet.id}/${response.activity.id}`,
    authToken,
    {
      metadata: JSON.stringify(response),
    },
    console.log("post response")
  );
};
export const postAppletBadge = (authToken, badge) => {
  console.log("post applet badge");
  const url = `${apiHost()}/applet/setBadge?badge=${badge}`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "post",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const signIn = ({ user, password, deviceId, timezone }) =>
  get("user/authentication", null, null, {
    "Girder-Authorization": `Basic ${btoa(`${user}:${password}`)}`,
    deviceId,
    timezone,
  });

export const signOut = (authToken) => {
  const url = `${apiHost()}/user/authentication`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "delete",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const forgotPassword = (email, lang) => {
  const queryParams = objectToQueryParams({ email, lang });
  const url = `${apiHost()}/user/password/temporary?${queryParams}`;
  return fetch(url, {
    method: "put",
    mode: "cors",
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const signUp = (userData) => {
  const url = `${apiHost()}/user`;
  return fetch(url, {
    method: "post",
    mode: "cors",
    body: objectToFormData(userData),
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const updateUserDetails = (
  authToken,
  { id, firstName, lastName, email }
) => {
  const url = `${apiHost()}/user/${id}`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "put",
    mode: "cors",
    headers,
    body: objectToFormData({
      firstName,
      lastName,
      email,
    }),
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const updatePassword = (authToken, oldPassword, newPassword) => {
  const url = `${apiHost()}/user/password`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "put",
    mode: "cors",
    headers,
    body: objectToFormData({
      old: oldPassword,
      new: newPassword,
    }),
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const fileLink = (file, token) =>
  file
    ? `${apiHost()}/${
        file["@id"]
      }/download?contentDisposition=inline&token=${token}`
    : "";

export const registerOpenApplet = (authToken, schemaURI) => {
  const url = `${apiHost()}/applet/invite`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "post",
    mode: "cors",
    headers,
    body: objectToFormData({ url: schemaURI }),
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

// export const getAppletSchedule = (authToken, appletId) => {
//   const url = `${apiHost()}/applet/${appletId}/schedule?getTodayEvents=true`;
//   const headers = {
//     'Girder-Token': authToken,
//   };
//   return fetch(url, {
//     method: 'get',
//     mode: 'cors',
//     headers,
//   }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
// };

export const getAppletSchedule = (authToken, appletId) =>
  get(`applet/${appletId}/schedule`, authToken, {
    getAllEvents: false,
    getTodayEvents: true,
  });

export const getAppletInvites = (authToken) => {
  const url = `${apiHost()}/user/invites`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "get",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const acceptAppletInvite = (authToken, id) => {
  const url = `${apiHost()}/group/${id}/member`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "post",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const declineAppletInvite = (authToken, id) => {
  const url = `${apiHost()}/group/${id}/member`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "delete",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const removeApplet = (authToken, groupId) => {
  const del = false;
  const url = `${apiHost()}/group/${groupId}/member?delete=${del}`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "delete",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const deleteApplet = (authToken, groupId) => {
  const del = true;
  const url = `${apiHost()}/group/${groupId}/member?delete=${del}`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "delete",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const deleteUserAccount = (authToken, userId) => {
  const url = `${apiHost()}/user/${userId}`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "delete",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const getLast7DaysData = ({
  authToken,
  appletId,
  referenceDate,
  groupByDateActivity,
}) => {
  let url = `${apiHost()}/response/last7Days/${appletId}`;
  if (referenceDate) {
    url += `?referenceDate=${referenceDate}`;
  }
  if (!groupByDateActivity) {
    url += `?groupByDateActivity=${groupByDateActivity}`;
  }
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "get",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : res)); // Promise.reject(res)));
};

export const replaceResponseData = ({
  authToken,
  userPublicKey,
  appletId,
  dataSources,
}) => {
  console.log("replace response data");
  let url = `${apiHost()}/response/${appletId}`;
  const headers = {
    "Girder-Token": authToken,
  };

  return fetch(url, {
    method: "put",
    mode: "cors",
    headers,
    body: objectToFormData({
      responses: JSON.stringify({ dataSources, userPublicKey }),
    }),
  }).then((res) => (res.status === 200 ? res.json() : res));
};

export const sendResponseReuploadRequest = ({ authToken, userPublicKeys }) => {
  console.log("send response reupload request");
  let url = `${apiHost()}/user/responseUpdateRequest`;

  const headers = {
    "Girder-Token": authToken,
  };

  return fetch(url, {
    method: "post",
    mode: "cors",
    headers,
    body: objectToFormData({
      userPublicKeys: JSON.stringify(userPublicKeys),
    }),
  }).then((res) => (res.status === 200 ? res.json() : res));
};

export const getUserUpdates = ({ authToken }) => {
  let url = `${apiHost()}/user/updates`;

  const headers = {
    "Girder-Token": authToken,
  };

  return fetch(url, {
    method: "get",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : res));
};
