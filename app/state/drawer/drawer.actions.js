import * as DRAWER_CONSTANTS from './drawer.constants';

export function openDrawer() {
  return {
    type: DRAWER_CONSTANTS.OPEN_DRAWER,
  };
}

export function closeDrawer() {
  return {
    type: DRAWER_CONSTANTS.CLOSE_DRAWER,
  };
}

export function changeMaterial() {
  return {
    type: DRAWER_CONSTANTS.CHANGE_MATERIAL,
  };
}

export function changePlatform() {
  return {
    type: DRAWER_CONSTANTS.CHANGE_PLATFORM,
  };
}
