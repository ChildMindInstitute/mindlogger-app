import CONSTANTS from './fcm.constants';

export const initialState = {
  fcmToken: null,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case CONSTANTS.SET_FCM_TOKEN:
      return {
        ...state,
        fcmToken: action.payload,
      };
    default:
      return state;
  }
};
