import APPLET_CONSTANTS from './applets.constants';

export const initialState = {
  applets: [],
  isDownloadingApplets: false,
  downloadProgress: {
    total: 0,
    downloaded: 0,
  },
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
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
    case APPLET_CONSTANTS.SET_APPLET_DOWNLOAD_PROGRESS:
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
