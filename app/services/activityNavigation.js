import { Parser } from 'expr-eval';
// import Screen from '../components/screen';

const NEXT = 'Next';
const SKIP = 'Skip';
const DONE = 'Done';
const BACK = 'Back';
const RETURN = 'Return';
const UNDO = 'Undo';

export const checkValidity = (item, response) => {
  if (item.inputType === 'markdown-message') {
    return true;
  }
  return (response !== null && typeof response !== 'undefined');
}

export const checkSkippable = activity => activity.allowRefuseToAnswer === true
  || activity.allowDoNotKnow === true;

// Returns true if item is visible
export const testVisibility = (testExpression = true, items = [], responses = []) => {
  // Short circuit for common testExpression
  if (testExpression === true || testExpression === 'true') {
    return true;
  }

  const parser = new Parser({
    logical: true,
    comparison: true,
  });

  let testExpressionFixed = testExpression.replace('&&', ' and ');
  testExpressionFixed = testExpressionFixed.replace('||', ' or ');

  const expr = parser.parse(testExpressionFixed);

  // Build an object where the keys are item variableNames, and values are
  // item responses
  const inputs = items.reduce((acc, item, index) => ({
    ...acc,
    [item.variableName]: responses[index] || null, // cast undefined to null
  }), {});

  // Run the expression
  const result = expr.evaluate(inputs);

  return !!result; // Cast the result to true or false
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

export const getNextLabel = (index, visibility, activity, responses) => {
  // If the screen is not valid, then the label is Skip
  const isValid = checkValidity(activity.items[index], responses[index]);
  if (!isValid) {
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
export const isNextEnabled = (index, activity, responses) => {
  const isValid = checkValidity(activity.items[index], responses[index]);
  const isSkippable = checkSkippable(activity);
  return isValid || isSkippable;
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

export const getActionLabel = (index, responses) => {
  const response = responses[index];
  return response === null || typeof response === 'undefined'
    ? undefined
    : UNDO;
};
