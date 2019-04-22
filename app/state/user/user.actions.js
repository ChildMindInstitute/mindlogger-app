import USER_CONSTANTS from './user.constants';

export const setInfo = info => ({
  type: USER_CONSTANTS.SET_INFO,
  payload: info,
});

export const setAuth = auth => ({
  type: USER_CONSTANTS.SET_AUTH,
  payload: auth,
});

export const setResponseCollectionId = id => ({
  type: USER_CONSTANTS.SET_RESPONSE_COLLECTION_ID,
  payload: id,
});

export const clearUser = () => ({
  type: USER_CONSTANTS.CLEAR,
});
