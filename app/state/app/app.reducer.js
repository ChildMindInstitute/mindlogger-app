import APP_CONSTANTS from './app.constants';
import config from '../../config';

export const initialState = {
  apiHost: config.defaultApiHost,
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
    default:
      return state;
  }
};
