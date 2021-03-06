import * as R from 'ramda';
import RESPONSES_CONSTANTS from './responses.constants';

export const initialState = {
  responseHistory: [],
  inProgress: {},
  isSelected: false,
  isDownloadingResponses: false,
  isSummaryScreen: false,
  downloadProgress: {
    total: 0,
    downloaded: 0,
  },
  uploadQueue: [],
  schedule: {},
  activityOpened: false,
};

const replaceAppletResponses = (state, action) => {
  const newResponse = action.payload[0];
  const responseHistory = [];
  const isExist = state.responseHistory.find(resp => resp.appletId === newResponse.appletId);
  if (isExist) {
    responseHistory.push(...state.responseHistory.map(
      resp => (resp.appletId === newResponse.appletId ? newResponse : resp),
    ));
  } else {
    responseHistory.push(...state.responseHistory);
    responseHistory.push(...action.payload);
  }
  return ({
    ...state,
    responseHistory,
  });
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case RESPONSES_CONSTANTS.CLEAR:
      return initialState;
    case RESPONSES_CONSTANTS.SET_SELECTED:
      return {
        ...state,
        isSelected: action.payload,
      };
    case RESPONSES_CONSTANTS.SET_SUMMARYSCREEN:
      return {
        ...state,
        isSummaryScreen: action.payload,
      };
    case RESPONSES_CONSTANTS.OPEN_ACTIVITY:
      return {
        ...state,
        activityOpened: action.payload,
      };
    case RESPONSES_CONSTANTS.REPLACE_RESPONSES:
      return {
        ...state,
        responseHistory: action.payload,
      };
    case RESPONSES_CONSTANTS.REPLACE_APPLET_RESPONSES:
      return replaceAppletResponses(state, action);
    case RESPONSES_CONSTANTS.SET_DOWNLOADING_RESPONSES:
      return {
        ...state,
        isDownloadingResponses: action.payload,
      };
    case RESPONSES_CONSTANTS.REMOVE_RESPONSE_IN_PROGRESS:
      return {
        ...state,
        inProgress: R.omit([action.payload], state.inProgress),
      };
    case RESPONSES_CONSTANTS.CREATE_RESPONSE_IN_PROGRESS:
      const { activity } = action.payload;

      return {
        ...state,
        inProgress: {
          ...state.inProgress,
          [activity.event ? activity.id + activity.event.id : activity.id]: {
            activity: R.clone(activity),
            responses: new Array(activity.items.length),
            subjectId: action.payload.subjectId,
            timeStarted: action.payload.timeStarted,
            screenIndex: 0,
          },
        },
      };
    case RESPONSES_CONSTANTS.SET_CURRENT_SCREEN:
      const { activityId, screenIndex } = action.payload;

      return {
        ...state,
        inProgress: {
          ...state.inProgress,
          [activityId]: {
            ...state.inProgress[activityId],
            screenIndex
          },
        },
      };
    case RESPONSES_CONSTANTS.SET_ANSWER:
      const currentAct = action.payload.activity;
      const index = currentAct.event ? currentAct.id + currentAct.event.id : currentAct.id;

      return {
        ...state,
        inProgress: {
          ...state.inProgress,
          [index]: {
            ...state.inProgress[index],
            responses: R.update(
              action.payload.screenIndex,
              action.payload.answer,
              state.inProgress[index].responses,
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
        schedule: action.payload,
      };
    default:
      return state;
  }
};
