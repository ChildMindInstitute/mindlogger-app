import USER_CONSTANTS from './user.constants';

export const setInfo = info => ({
  type: USER_CONSTANTS.SET_INFO,
  payload: info,
});

export const setAuth = auth => ({
  type: USER_CONSTANTS.SET_AUTH,
  payload: auth,
});

export const clearUser = () => ({
  type: USER_CONSTANTS.CLEAR,
});
