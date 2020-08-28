import APPLET_CONSTANTS from './applets.constants';

export const initialState = {
  /**
   * List of applets for the current logged in account.
   *
   * @type {object}.
   */
  applets: [],
  scheduleUpdated: false,
  currentTime: new Date(),
  isDownloadingApplets: false,
  isDownloadingTargetApplet: false,
  downloadProgress: {
    total: 0,
    downloaded: 0,
  },
  notifications: {},
  invites: [],
  currentInvite: '',
  appletResponseData: {},
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case APPLET_CONSTANTS.CLEAR:
      return initialState;
    case APPLET_CONSTANTS.REPLACE_APPLETS:
      return {
        ...state,
        applets: action.payload,
        currentTime: new Date(),
      };
    case APPLET_CONSTANTS.SET_SELECTION_DISABLED:
      return { 
        ...state, 
        selectionDisabled: action.payload 
      };
    case APPLET_CONSTANTS.REPLACE_TARGET_APPLET:
      return {
        ...state,
        applets: [
          ...state.applets.map(applet => (applet.id === action.payload.id ? action.payload : applet)),
        ],
      };
    case APPLET_CONSTANTS.SET_SCHEDULE_UPDATED:
      return {
        ...state,
        scheduleUpdated: action.payload,
      };
    case APPLET_CONSTANTS.REPLACE_TARGET_APPLETSCHEDULE:
      const newState = {
        ...state,
        applets: [
          ...state.applets.map((applet) =>
            applet.id === "applet/" + action.payload.appletId
              ? { ...applet, schedule: action.payload.schedule }
              : applet
          ),
        ],
        scheduleUpdated: true,
      };
      return newState;
    case APPLET_CONSTANTS.SET_DOWNLOADING_APPLETS:
      return {
        ...state,
        isDownloadingApplets: action.payload,
      };
    case APPLET_CONSTANTS.SET_DOWNLOADING_TARGET_APPLET:
      return {
        ...state,
        isDownloadingTargetApplet: action.payload,
      };
    case APPLET_CONSTANTS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
      };
    case APPLET_CONSTANTS.SET_INVITES:
      return {
        ...state,
        invites: action.payload,
      };
    case APPLET_CONSTANTS.SET_CURRENT_INVITE:
      return {
        ...state,
        currentInvite: action.payload,
      };
    case APPLET_CONSTANTS.SAVE_APPLET_RESPONSE_DATA:
      // eslint-disable-next-line
      const stateCopy = { ...state };
      stateCopy.appletResponseData[action.payload.appletId] = action.payload.data;
      return stateCopy;
    default:
      return state;
  }
};
