import Screen from '../components/screen';

const NEXT = 'Next';
const SKIP = 'Skip';
const DONE = 'Done';
const BACK = 'Back';
const RETURN = 'Return';
const UNDO = 'Undo';

export const checkValidity = (item, response) => Screen.isValid(response, item);

export const checkSkippable = (activity, item) => {
  if (typeof item.skippable !== 'undefined') {
    return item.skippable;
  }
  if (activity.skippable === true) {
    return true;
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

export const getNextLabel = (index, visibility, activity, responses, isContentError) => {
  // If the screen is not valid, then the label is Skip
  const isValid = checkValidity(activity.items[index], responses[index]);
  if (!isValid || isContentError) {
    return SKIP;
  }

  // If there are visible items after this one, then label is Next
  const nextPos = getNextPos(index, visibility);
  if (nextPos !== -1) {
    return NEXT;
  }

  // If this is the last visible item, then label is Done
  return DONE;
};

// If item has a valid response, or is skippable, then next is enabled
export const isNextEnabled = (index, activity, responses, isContentError) => {
  const isValid = checkValidity(activity.items[index], responses[index]);
  const isSkippable = checkSkippable(activity, activity.items[index]);
  return isValid || isSkippable || isContentError;
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
    return BACK;
  }

  // If this is the first visible item, then label is Done
  return RETURN;
};

export const getActionLabel = (index, responses, items) => {
  const response = responses[index];
  if (response === null || typeof response === 'undefined') {
    return undefined;
  }
  if (items[index].inputType === 'audioStimulus') {
    return undefined;
  }
  return UNDO;
};
