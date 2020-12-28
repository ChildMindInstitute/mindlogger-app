import { Parser } from 'expr-eval';

export const getScoreFromResponse = (item, value) => {
  if (value == null || item.inputType !== 'radio' && item.inputType !== 'slider') {
    return 0;
  }

  const valueConstraints = item.valueConstraints || {};
  const itemList = valueConstraints.itemList || [];

  if (!valueConstraints.scoring) {
    return 0;
  }

  let response = value;
  if (typeof response == 'number' || typeof response == 'string') {
    response = [response];
  }

  let totalScore = 0;

  for (let value of response) {
    let option = itemList.find(option => 
      typeof value == 'number' && option.value === value || 
      typeof value == 'string' && Object.values(option.name)[0] === value
    );

    if (option && option.score) {
      totalScore += option.score;
    }
  }

  return totalScore;
}


export const evaluateScore = (testExpression, items = [], scores = []) => {
  const parser = new Parser();

  try {
    const expr = parser.parse(testExpression);
    // Build an object where the keys are item variableNames, and values are
    // item responses
    const inputs = items.reduce((acc, item, index) => ({
      ...acc,
      [item.variableName]: scores[index],
    }), {});

    // Run the expression
    const result = expr.evaluate(inputs);
    return result;
  } catch (error) {
    return null;
  }
};

export const getMaxScore = (item) => {
  if (item.inputType !== 'radio' && item.inputType !== 'slider') {
    return 0;
  }

  const valueConstraints = item.valueConstraints || {};
  const itemList = valueConstraints.itemList || [];

  if (!valueConstraints.scoring) {
    return 0;
  }

  const oo = 1e6;
  return itemList.reduce((previousValue, currentOption) => {
    return valueConstraints.multipleChoice ? Math.max(currentOption.score + previousValue, previousValue) : Math.max(currentOption.score, previousValue)
  }, valueConstraints.multipleChoice ? 0 : -oo);
}

export const getScoreFromLookupTable = (responses, jsExpression, items, lookupTable) => {
  let scores = [];
  for (let i = 0; i < responses.length; i++) {
    scores.push(getScoreFromResponse(items[i], responses[i]));
  }

  let subScaleScore = evaluateScore(jsExpression, items, scores);
  if (!lookupTable) {
    return subScaleScore;
  }

  const age = responses[items.findIndex(item => item.variableName === 'age_screen')];
  const gender = responses[items.findIndex(item => item.variableName === 'gender_screen')] ? 'F' : 'M';

  const isValueInRange = (value, lookupInfo) => {
    if (!lookupInfo || lookupInfo == value) {
      return true;
    }

    const matched = lookupInfo.match(/^(\d+)\s*[-~]\s*(\d+)$/);

    if (matched) {
      value = parseInt(value);

      return !isNaN(value) && value >= parseInt(matched[1]) && value <= parseInt(matched[2]);
    }
    return false;
  };

  for (let row of lookupTable) {
    if ( 
      isValueInRange(subScaleScore, row.rawScore) && 
      isValueInRange(age, row.age) &&
      isValueInRange(gender, row.gender)
    ) {
      return parseInt(row.tScore);
    }
  }

  return subScaleScore;
}
