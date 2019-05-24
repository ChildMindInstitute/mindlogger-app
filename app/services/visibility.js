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
