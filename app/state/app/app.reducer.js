import APP_CONSTANTS from './app.constants';
import config from '../../config';

export const initialState = {
  apiHost: config.defaultApiHost,
  skin: config.defaultSkin,
  currentApplet: null,
  currentActivity: null,
  mobileDataAllowed: true,
  appStatus: false,
  lastUpdatedTime: {},
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case APP_CONSTANTS.SET_API_HOST:
      return {
        ...state,
        apiHost: action.payload,
      };
    case APP_CONSTANTS.SET_UPDATED_TIME:
      return {
        ...state,
        lastUpdatedTime: action.payload,
      };
    case APP_CONSTANTS.RESET_API_HOST:
      return {
        ...state,
        apiHost: initialState.apiHost,
      };
    case APP_CONSTANTS.SET_APP_STATUS:
      return {
        ...state,
        appStatus: action.payload,
      };
    case APP_CONSTANTS.SET_SKIN:
      return {
        ...state,
        skin: action.payload,
      };
    case APP_CONSTANTS.SET_CURRENT_APPLET:
      return {
        ...state,
        currentApplet: action.payload,
      };
    case APP_CONSTANTS.SET_CURRENT_ACTIVITY:
      return {
        ...state,
        currentActivity: action.payload,
      };
    case APP_CONSTANTS.TOGGLE_MOBILE_DATA_ALLOWED:
      return {
        ...state,
        mobileDataAllowed: !state.mobileDataAllowed,
      };
    default:
      return state;
  }
};
