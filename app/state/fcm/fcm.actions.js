import CONSTANTS from './fcm.constants';

export const setFcmToken = fcmToken => ({
  type: CONSTANTS.SET_FCM_TOKEN,
  payload: fcmToken,
});
