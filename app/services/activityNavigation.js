import i18n from 'i18next';
import Screen from '../components/screen';

const NEXT = i18n.t('activity_navigation:next');
const SKIP = i18n.t('activity_navigation:skip');
const DONE = i18n.t('activity_navigation:done');
const BACK = i18n.t('activity_navigation:back');
const RETURN = i18n.t('activity_navigation:return');
const UNDO = i18n.t('activity_navigation:undo');

export const checkValidity = (item, response) => Screen.isValid(response, item);

export const checkSkippable = (activity, item) => {
  if (activity.skippable === true) {
    return true;
  }

  if (item.valueConstraints && item.valueConstraints.isOptionalTextRequired) {
    return false;
  }

  if (typeof item.skippable !== 'undefined') {
    return item.skippable;
  }
  return false;
};

// Gets the next position of array after index that is true, or -1
export const getNextPos = (index, ar) => {
  for (let i = index + 1; i < ar.length; i += 1) {
    if (ar[i] === true) {
      return i;
    }
  }
  return -1;
};

// Gets the last position of array before index that is true, or -1
export const getLastPos = (index, ar) => {
  if (index === 0) {
    return -1;
  }
  for (let i = index - 1; i >= 0; i -= 1) {
    if (ar[i] === true) {
      return i;
    }
  }
  return -1;
};

export const getNextLabel = (index, isSplashScreen, visibility, activity, responses, isContentError) => {
  // If the screen is not valid, then the label is Skip
  const isValid = checkValidity(activity.items[index], responses[index]);

  if (isSplashScreen) {
    return i18n.t('activity_navigation:next');
  }
  if (!isValid || isContentError) {
    return i18n.t('activity_navigation:skip');
  }

  // If there are visible items after this one, then label is Next
  const nextPos = getNextPos(index, visibility);
  if (nextPos !== -1) {
    return i18n.t('activity_navigation:next');
  }

  // If this is the last visible item, then label is Done
  return i18n.t('activity_navigation:done');
};

// If item has a valid response, or is skippable, then next is enabled
export const isNextEnabled = (index, activity, responses) => {
  const isValid = checkValidity(activity.items[index], responses[index]);
  const isSkippable = checkSkippable(activity, activity.items[index]);
  return isValid || isSkippable;
};

export const isPrevEnabled = (index, activity) => {
  if (activity.items[index].backDisabled === true) {
    return false;
  }
  if (activity.backDisabled === true) {
    return false;
  }
  return true;
};

export const getPrevLabel = (index, visibility) => {
  // If there are visible items before this one, then label is Back
  const lastPos = getLastPos(index, visibility);
  if (lastPos !== -1) {
    return i18n.t('activity_navigation:back');
  }

  // If this is the first visible item, then label is Done
  return i18n.t('activity_navigation:return');
};

export const getActionLabel = (index, responses, items) => {
  const response = responses[index];
  if (response === null || typeof response === 'undefined') {
    return undefined;
  }
  if (items[index].inputType === 'audioStimulus') {
    return undefined;
  }
  return i18n.t('activity_navigation:undo');
};
