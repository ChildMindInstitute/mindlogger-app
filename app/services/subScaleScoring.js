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


export const getSubScaleScore = (testExpression, items = [], scores = []) => {
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
    return 0;
  }
};
