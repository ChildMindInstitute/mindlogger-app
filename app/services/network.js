import objectToFormData from "object-to-formdata";
import RNFetchBlob from "rn-fetch-blob";
import RNFS from 'react-native-fs';
import EncryptedStorage from 'react-native-encrypted-storage'

import { getStore } from "../store";
import { UserInfoStorage } from '../features/system'

// eslint-disable-next-line
import { btoa } from "./helper";
import { apiHostSelector } from "../state/app/app.selectors";

const userInfoStorage = UserInfoStorage(EncryptedStorage)

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
    return res.status === 200 ? res.json() : Promise.reject(res);
  })
};

export const postFile = async ({ authToken, file, appletId, activityId, appletVersion }) => {
  const url = `${apiHost()}/response/${appletId}/${activityId}`;

  const headers = {
    "Girder-Token": authToken,
  };
  const metadata = JSON.stringify({
    "applet": { "schemaVersion": appletVersion },
    "subject": { "@id": "asasa", "timezone": "US" },
    "responses": {
      [file.key]: { "size": file.size, "type": file.type }
    }
  });

  if (file.uri.includes('content://')) {
    const form = new FormData();

    form.append(file.key, {
      name: file.filename,
      type: file.type,
      uri: Platform.OS === 'ios' ?
           file.uri.replace('file://', '')
           : file.uri,
    });

    form.append('metadata', metadata);
    return fetch(url, {
      method: 'post',
      headers,
      body: form
    }).then(async res => {
      return res.status === 200 ? await res.json() : Promise.reject(res);
    }).catch(err => {
      Promise.reject(err);
      console.log(err)
    })
  }

  return RNFS.uploadFiles({
    toUrl: url,
    files: [
      {
        name: file.key,
        filename: file.filename,
        filepath: Platform.OS === 'ios' ?
          file.uri.replace('file://', '')
          : file.uri,
        filetype: file.type
      }
    ],
    method: 'POST',
    headers,
    fields: { metadata },
  }).promise.then(async res => {
      return res.statusCode === 200 ? res.body : Promise.reject(res);
    }).catch(err => {
      Promise.reject(err);
      console.log(err)
    })
};

export const getSkin = () => get("context/skin", null, null);

export const getResponses = (authToken, applet) =>
  get("response", authToken, { applet });

export const getSchedule = (authToken, timezone) =>
  get("schedule", authToken, { timezone });

export const getApplets = (authToken, localInfo, currentApplet = '', nextActivity = '') => {
  const queryParams = objectToQueryParams({
    role: "user",
    getAllApplets: true,
    retrieveSchedule: true,
    retrieveResponses: true,
    numberOfDays: 7,
    groupByDateActivity: false,
    retrieveLastResponseTime: true,
    currentApplet,
    nextActivity
  });
  const url = `${apiHost()}/user/applets?${queryParams}`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "put",
    mode: "cors",
    headers,
    body: objectToFormData({ localInfo: JSON.stringify(localInfo) }),
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res))).then(res => {
    if (res.nextActivity) {
      return new Promise(resolve => setTimeout(() => resolve(getApplets(authToken, localInfo, res.currentApplet, res.nextActivity).then(next => {
        for (const applet of next.data) {
          const d = res.data.find(d => d.id == applet.id);
          if (!d) {
            res.data.push(applet);
            continue;
          }

          for (const IRI in applet.items) {
            d.items[IRI] = applet.items[IRI]
          }

          for (const IRI in applet.activities) {
            d.activities[IRI] = applet.activities[IRI]
          }
        }

        return res;
      })), 50));
    }
    return res;
  })
}

// export const getTargetApplet = (authToken, appletId) => get(
//   `applet/${appletId}`,
//   authToken,
//   { retrieveSchedule: true, retrieveAllEvents: true, retrieveItems: true },
// );

export const exportPDF = (serverIP, authToken, responses, now, appletId, activityFlowId, activityId, responseId) => {
  const queryParams = objectToQueryParams({ appletId, activityFlowId, activityId, responseId });
  const url = serverIP + (serverIP.endsWith('/') ? '' : '/') + 'send-pdf-report';

  return fetch(`${url}/?${queryParams}`, {
    method: "post",
    mode: "cors",
    headers: {
      'Content-Type': 'application/json',
      token: authToken
    },
    body: JSON.stringify({
      responses,
      now
    })
  })
}

export const getTargetApplet = (authToken, appletId, nextActivity = '') => {
  return get(`user/applet/${appletId}`, authToken, {
    retrieveSchedule: true,
    role: "user",
    getAllApplets: true,
    nextActivity,
    numberOfDays: 7
  }).then(resp => {
    if (resp.nextActivity) {
      return new Promise(resolve => setTimeout(() => resolve(getTargetApplet(authToken, appletId, resp.nextActivity).then(next => {
        for (const IRI in next.items) {
          resp.items[IRI] = next.items[IRI]
        }

        for (const IRI of next.activities) {
          resp.activities[IRI] = next.activities[IRI]
        }

        return resp;
      })), 50));
    }

    return resp;
  })
}

export const postResponse = ({ authToken, response }) => {
  return postFormData(
    `response/${response.applet.id}/${response.activity.id}`,
    authToken,
    {
      metadata: JSON.stringify(response),
    },
  );
};

export const postAppletBadge = (authToken, badge) => {
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
  get("user/authentication", null, { returnKeys: true }, {
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

export const updatePassword = (authToken, oldPassword, newPassword, email) => {
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
      email
    }),
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};

export const fileLink = (file, token) =>
  file
    ? `${apiHost()}/${file["@id"]}/download?contentDisposition=inline&token=${token}`
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

export const getAppletSchedule = (authToken, appletId) => {
  const queryParams = `?${objectToQueryParams({
    getAllEvents: false,
    numberOfDays: 7
  })}`;

  const url = `${apiHost()}/applet/${appletId}/getSchedule${queryParams}`;

  const headers = {};
  if (authToken) {
    headers["Girder-Token"] = authToken;
  }

  return fetch(url, {
    method: "put",
    mode: "cors",
    headers,
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
}

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
  localItems,
  localActivities,
  startDate,
  groupByDateActivity,
}) => {
  let url = `${apiHost()}/response/last7Days/${appletId}`;
  if (!groupByDateActivity) {
    url += `?groupByDateActivity=${groupByDateActivity}`;
  }
  url += `?localItems=${localItems}`;
  url += `?localActivities=${localActivities}`;
  url += `?startDate=${startDate}`;
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
  dataSources
}) => {
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
  }).then(res => (res.status === 200 ? res.json() : res));
};

export const downloadTokenResponses = (authToken, appletId, startDate) => {
  let url = `${apiHost()}/response/tokens/${appletId}`;
  const headers = {
    "Girder-Token": authToken
  };

  if (startDate) {
    url += `?startDate=${startDate}`;
  }

  return fetch(url, {
    method: "get",
    mode: "cors",
    headers,
  }).then(res => (res.status === 200 ? res.json() : res))
}

export const updateUserTokenBalance = (authToken, appletId, cumulative, changes, version, userPublicKey, rewardTime=0) => {
  const url = `${apiHost()}/response/${appletId}/updateResponseToken`;
  const headers = {
    "Girder-Token": authToken,
  };
  return fetch(url, {
    method: "post",
    mode: "cors",
    headers,
    body: objectToFormData({
      updateInfo: JSON.stringify({
        cumulative,
        changes,
        version,
        userPublicKey,
        isReward: rewardTime ? true : false,
        rewardTime,
      })
    })
  }).then(res => (res.status === 200 ? res.json() : Promise.reject(res)));
};

/*
Add a new notification object.
Parameters:
actionType: 1 totalReschedule-[trigger], 2 backgroundAddition
From background passed:
  notificationsInQueue, 
  scheduledNotifications
From re-scheduling: all three properties passed:
  notificationDescriptions, 
  notificationsInQueue, 
  scheduledNotifications
*/
export const addScheduleNotificationDebugObjects = async ({
  userId,
  deviceId,
  actionType,
  notificationDescriptions,
  notificationsInQueue,
  scheduledNotifications,
}) => {
  const apiHost = await userInfoStorage.getApiHost();
  const url = `${apiHost}/notification/logs`;
  const headers = {};

  return fetch(url, {
    method: "post",
    mode: "cors",
    headers,
    body: JSON.stringify({
      userId,
      deviceId,
      actionType,
      notificationDescriptions,
      notificationsInQueue,
      scheduledNotifications,
    }),
  }).then((res) => (res.status === 200 ? res.json() : Promise.reject(res)));
};
