import APPLET_CONSTANTS from './applets.constants';

export const initialState = {
  applets: [],
  isDownloadingApplets: false,
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
      };
    case APPLET_CONSTANTS.SET_DOWNLOADING_APPLETS:
      return {
        ...state,
        isDownloadingApplets: action.payload,
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
