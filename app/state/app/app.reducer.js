import APP_CONSTANTS from './app.constants';
import config from '../../config';

export const initialState = {
  apiHost: config.defaultApiHost,
  currentApplet: null,
  currentActivity: null,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case APP_CONSTANTS.SET_API_HOST:
      return {
        ...state,
        apiHost: action.payload,
      };
    case APP_CONSTANTS.RESET_API_HOST:
      return {
        ...state,
        apiHost: initialState.apiHost,
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
    default:
      return state;
  }
};
