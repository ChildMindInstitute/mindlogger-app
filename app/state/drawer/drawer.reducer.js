import * as DRAWER_CONSTANTS from './drawer.constants';

const initialState = {
  drawerState: 'closed',
  drawerDisabled: true,
  themeState: 'platform',
};

export default function (state = initialState, action) {
  if (action.type === DRAWER_CONSTANTS.OPEN_DRAWER) {
    return {
      ...state,
      drawerState: 'opened',
    };
  }

  if (action.type === DRAWER_CONSTANTS.CLOSE_DRAWER) {
    return {
      ...state,
      drawerState: 'closed',
    };
  }

  if (action.type === DRAWER_CONSTANTS.CHANGE_PLATFORM) {
    return {
      ...state,
      themeState: 'platform',
    };
  }

  if (action.type === DRAWER_CONSTANTS.CHANGE_MATERIAL) {
    return {
      ...state,
      themeState: 'material',
    };
  }

  return state;
}
