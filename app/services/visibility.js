import { Parser } from 'expr-eval';

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

  let testExpressionFixed = testExpression.replace(/&&/g, ' and ');
  testExpressionFixed = testExpressionFixed.replace(/\|\|/g, ' or ');
  testExpressionFixed = testExpressionFixed.replace('===', '==');
  testExpressionFixed = testExpressionFixed.replace('!==', '!=');
  testExpressionFixed = testExpressionFixed.replace(/(\w+\.)/g, 'arrayIncludes($&');
  testExpressionFixed = testExpressionFixed.replace(/.includes\(/g, ', ');

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

  parser.functions.arrayIncludes = arrayIncludes;


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
