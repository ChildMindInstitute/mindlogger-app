import * as API_CONSTANTS from '../api/api.constants';

export const setUserLocal = user => ({
  type: API_CONSTANTS.SET_USER,
  data: user,
});

export const updateUserLocal = user => ({
  type: API_CONSTANTS.UPDATE_USER,
  data: user,
});

export const updateActivity = (index, data) => ({
  type: API_CONSTANTS.UPDATE_ACTIVITY,
  index,
  data,
});

export const setAnswer = data => ({
  type: API_CONSTANTS.SET_ANSWER,
  data,
});

export const setActivity = (data, info, options) => ({
  type: API_CONSTANTS.SET_ACTIVITY,
  data,
  meta: {
    info,
    options,
  },
});

export const setVolume = volume => ({
  type: API_CONSTANTS.SET_DATA,
  data: { volume },
});

export const setVolumes = volumes => ({
  type: API_CONSTANTS.SET_DATA,
  data: { volumes },
});

export const setActs = acts => ({
  type: API_CONSTANTS.SET_DATA,
  data: { acts },
});

export const setDataObject = object => ({
  type: API_CONSTANTS.SET_DATA_OBJECT,
  object,
});

export const setActChanged = actChanged => ({
  type: API_CONSTANTS.SET_DATA,
  data: { actChanged },
});

export const setNotificationStatus = notifications => ({
  type: API_CONSTANTS.SET_DATA,
  data: { notifications, checkedTime: Date.now() },
});

export const clearNotificationStatus = () => ({
  type: API_CONSTANTS.SET_DATA,
  data: { notifications: {}, checkedTime: undefined },
});

export const addQueue = (name, payload, volumeName, collectionId) => ({
  type: API_CONSTANTS.ADD_QUEUE,
  data: {
    name,
    payload,
    volumeName,
    collectionId,
  },
});

export const updateQueue = answerCache => ({
  type: API_CONSTANTS.SET_DATA,
  data: { answerCache },
});
