import * as R from 'ramda';
import RESPONSES_CONSTANTS from './responses.constants';

export const initialState = {
  responseHistory: [],
  inProgress: {},
  isDownloadingResponses: false,
  downloadProgress: {
    total: 0,
    downloaded: 0,
  },
  uploadQueue: [],
  schedule: {},
  scheduleFlag: false,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case RESPONSES_CONSTANTS.CLEAR:
      return initialState;
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
          [action.payload.activity.id]: {
            activity: R.clone(action.payload.activity),
            responses: new Array(action.payload.activity.items.length),
            subjectId: action.payload.subjectId,
            timeStarted: action.payload.timeStarted,
            screenIndex: 0,
          },
        },
      };
    case RESPONSES_CONSTANTS.SET_ANSWERS:
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
    case RESPONSES_CONSTANTS.SET_CURRENT_SCREEN:
      return {
        ...state,
        inProgress: {
          ...state.inProgress,
          [action.payload.activityId]: {
            ...state.inProgress[action.payload.activityId],
            screenIndex: action.payload.screenIndex,
          },
        },
      };
    case RESPONSES_CONSTANTS.SET_ANSWER:
      return {
        ...state,
        inProgress: {
          ...state.inProgress,
          [action.payload.activityId]: {
            ...state.inProgress[action.payload.activityId],
            responses: R.update(
              action.payload.screenIndex,
              action.payload.answer,
              state.inProgress[action.payload.activityId].responses,
            ),
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
    case RESPONSES_CONSTANTS.ADD_TO_UPLOAD_QUEUE:
      return {
        ...state,
        uploadQueue: [...state.uploadQueue, action.payload],
      };
    case RESPONSES_CONSTANTS.SHIFT_UPLOAD_QUEUE:
      return {
        ...state,
        uploadQueue: R.remove(0, 1, state.uploadQueue),
      };
    case RESPONSES_CONSTANTS.SET_SCHEDULE:
      return {
        ...state,
        scheduleFlag: !state.scheduleFlag,
        schedule: action.payload,
      };
    default:
      return state;
  }
};
