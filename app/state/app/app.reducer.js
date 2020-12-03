import APP_CONSTANTS from './app.constants';
import config from '../../config';

export const initialState = {
  /**
   * The URL to the HTTP API server.
   *
   * @type {string}
   */
  apiHost: config.defaultApiHost,

  /**
   * The current skin (theme) for the app.
   *
   * @type {object}
   * @property {string} name the name of the skin.
   * @property {object} colors the current colors.
   * @property {string} colors.primary the primary color.
   * @property {string} colors.secondary the secondary color.
   */
  skin: config.defaultSkin,

  /**
   * The ID of the current applet.
   *
   * @type {string}
   */
  currentApplet: null,

  /**
   * The ID of the current activity.
   *
   * @type {string}
   */
  currentActivity: null,

  /**
   * Whether the applet cards are disabled.
   *
   * @type {boolean}.
   */
  appletSelectionDisabled: false,

  /**
   * Whether the activity cards are disabled.
   *
   * @type {boolean}.
   */
  activitySelectionDisabled: false,

  /**
   * If false, applet data will only be downloaded using Wi-Fi.
   *
   * @type {boolean}
   */
  mobileDataAllowed: true,

  /**
   * True if the application is in the foreground, false otherwise.
   *
   * @type {boolean}
   */
  appStatus: false,

  /**
   * app language code
   *
   * @type {string}
   */
  appLanguage: 'en',

  /**
   * Maps applet IDs to the last time the schedule was fetched for that applet.
   *
   * @type {object}
   */
  lastUpdatedTime: {},

  /**
   * Times activities started
   *
   * @type {object}
   */
  startedTimes: {},
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
    case APP_CONSTANTS.SET_ACTIVITY_START_TIME:
      return {
        ...state,
        startedTimes: {
          ...state.startedTimes,
          [action.payload]: Date.now()
        },
      };
    case APP_CONSTANTS.CLEAR_ACTIVITY_START_TIME:
      return {
        ...state,
        startedTimes: {
          ...state.startedTimes,
          [action.payload]: null,
        },
      }
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
    case APP_CONSTANTS.SET_APPLET_SELECTION_DISABLED:
      return {
        ...state,
        appletSelectionDisabled: action.payload,
      };
    case APP_CONSTANTS.SET_ACTIVITY_SELECTION_DISABLED:
      return {
        ...state,
        activitySelectionDisabled: action.payload,
      };
    case APP_CONSTANTS.TOGGLE_MOBILE_DATA_ALLOWED:
      return {
        ...state,
        mobileDataAllowed: !state.mobileDataAllowed,
      };
    case APP_CONSTANTS.SET_APP_LANGUAGE:
      return {
        ...state,
        appLanguage: action.payload,
      };

    default:
      return state;
  }
};
