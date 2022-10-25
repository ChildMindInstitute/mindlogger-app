import { Parser } from 'expr-eval';

// Returns true if item is visible
export const testVisibility = (testExpression = true, items = [], responses = [], responseTimes = {}) => {
  // Short circuit for common testExpression
  if (testExpression === true || testExpression === 'true') {
    return true;
  }

  const parser = new Parser({
    logical: true,
    comparison: true,
  });

  let testExpressionFixed = testExpression
    .replace(/&&/g, ' and ')
    .replace(/\|\|/g, ' or ')
    .replace('===', '==')
    .replace('!==', '!=')
    .replace(/(\w+\.)/g, 'arrayIncludes($&')
    .replace(/.includes\(/g, ', ')
    .replace(/!arrayIncludes/g, 'arrayNotIncludes')
    .replace(/!isActivityShownFirstTime/g, 'isActivityNowShownFirstTime');

  // Custom function to test if element is present in array
  const arrayIncludes = (array, element) => {
    if (array === undefined || array === null) {
      return false;
    }
    for (let i = 0; i < array.length; i += 1) {
      if (array[i] === element) {
        return true;
      }
    }
    return false;
  };

  const arrayNotIncludes = (array, element) => {
    if (array === undefined || array === null) {
      return false;
    }
    for (let i = 0; i < array.length; i += 1) {
      if (array[i] === element) {
        return false;
      }
    }
    return true;
  };

  const isActivityShownFirstTime = (expression) => {
    const activity = expression.replace(/ /g, '_');
    return !responseTimes[activity];
  }

  const isActivityNowShownFirstTime = (expression) => {
    const activity = expression.replace(/ /g, '_');
    return !!responseTimes[activity];
  }

  parser.functions.arrayIncludes = arrayIncludes;
  parser.functions.arrayNotIncludes = arrayNotIncludes;
  parser.functions.isActivityShownFirstTime = isActivityShownFirstTime;
  parser.functions.isActivityNowShownFirstTime = isActivityNowShownFirstTime;

  try {
    const expr = parser.parse(testExpressionFixed);
    // Build an object where the keys are item variableNames, and values are
    // item responses
    const inputs = items.reduce((acc, item, index) => {
      const response = (responses[index] && (responses[index].value || responses[index].value === 0))
        ? responses[index].value
        : responses[index];

      return {
        ...acc,
        [item.variableName]: responses[index] === 0 ? 0 : (response === 0 ? 0 : response || null), // cast undefined to null
      }
    }, {});

    // Run the expression
    const result = expr.evaluate(inputs);
    return !!result; // Cast the result to true or false
  } catch (error) {
    return true; // Default to true if we can't parse the expression
  }
};

export const collectResponseTimes = (currentApplet, lastResponseTime) => {
  const responseTimes = {};

  for (const activity of currentApplet.activities) {
    const activityNameKey = activity.name.en.replace(/\s/g, '_');
    const lastResponseTimeForApplet = lastResponseTime[currentApplet.id] || {};
    responseTimes[activityNameKey] = lastResponseTimeForApplet[activity.id];
  }
  return responseTimes;
}

export const getItemsVisibility = (activity, responses, responseTimes) => {
  const result = activity.items.map((item) => {
    if (item.isVis) {
      return false;
    }
    return testVisibility(item.visibility, activity.items, responses, responseTimes)
  });
  return result;
}