import * as R from 'ramda';
import RESPONSES_CONSTANTS from './responses.constants';

export const initialState = {
  responseHistory: [],
  inProgress: {},
  currentActivity: null,
  isDownloadingResponses: false,
  downloadProgress: {
    total: 0,
    downloaded: 0,
  },
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case RESPONSES_CONSTANTS.REPLACE_RESPONSES:
      return {
        ...state,
        responseHistory: action.payload,
      };
    case RESPONSES_CONSTANTS.SET_DOWNLOADING_RESPONSES:
      return {
        ...state,
        isDownloadingResponses: action.payload,
      };
    case RESPONSES_CONSTANTS.SET_CURRENT_ACTIVITY:
      return {
        ...state,
        currentActivity: action.payload,
      };
    case RESPONSES_CONSTANTS.UPDATE_RESPONSE_IN_PROGRESS:
      return {
        ...state,
        inProgress: {
          ...state.inProgress,
          [action.payload.activityId]: {
            ...state.inProgress[action.payload.activityId],
            responses: action.payload.response,
          },
        },
      };
    case RESPONSES_CONSTANTS.REMOVE_RESPONSE_IN_PROGRESS:
      return {
        ...state,
        inProgress: R.omit([action.payload], state.inProgress),
      };
    case RESPONSES_CONSTANTS.CREATE_RESPONSE_IN_PROGRESS:
      return {
        ...state,
        inProgress: {
          ...state.inProgress,
          [action.payload._id]: {
            activity: R.clone(action.payload),
            responses: {},
          },
        },
      };
    case RESPONSES_CONSTANTS.SET_RESPONSES_DOWNLOAD_PROGRESS:
      return {
        ...state,
        downloadProgress: {
          downloaded: action.payload.downloaded,
          total: action.payload.total,
        },
      };
    default:
      return state;
  }
};
