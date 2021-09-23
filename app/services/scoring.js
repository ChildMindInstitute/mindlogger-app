import { Parser } from 'expr-eval';
import _ from "lodash";
import moment from 'moment';

export const getScoreFromResponse = (item, value) => {
  if (value === null || item.inputType !== 'radio' && item.inputType !== 'slider') {
    return 0;
  }

  const valueConstraints = item.valueConstraints || {};
  const itemList = valueConstraints.itemList || [];

  const isScoring = valueConstraints.scoring || _.findIndex(itemList, obj => Boolean(obj.score)) > -1;
  if (!isScoring) {
    return 0;
  }

  let response = value;
  if (typeof response === 'number' || typeof response === 'string') {
    response = [response];
  } else if (typeof response === 'object' && !Array.isArray(response)) {
    if (!Array.isArray(response.value)) {
      response = [response.value];
    } else {
      response = response.value;
    }
  }

  let totalScore = 0;

  for (let value of response) {
    if (typeof value === 'number' || typeof value === 'string') {
      let option = itemList.find(option =>
        typeof value === 'number' && option.value === value ||
        typeof value === 'string' && Object.values(option.name)[0] === value
      );

      if (option && option.score) {
        totalScore += option.score;
      }
    } else {

    }
  }

  return totalScore;
}

export const getValuesFromResponse = (item, value) => {
  if (value === null || value === undefined || item.inputType !== 'radio' && item.inputType !== 'slider') {
    return null;
  }

  const valueConstraints = item.valueConstraints || {};
  const itemList = valueConstraints.itemList || [];

  let response = value;
  if (typeof response === 'number' || typeof response === 'string') {
    response = [response];
  } else if (typeof response === 'object' && !Array.isArray(response)) {
    response = [response.value]
  }

  const tokenValues = [];

  for (let value of response) {
    let option = itemList.find(option =>
      typeof value === 'number' && option.value === value ||
      typeof value === 'string' && Object.values(option.name)[0] === value
    );

    if (option && option.value) {
      tokenValues.push(option.value);
    } else {
      tokenValues.push(0);
    }
  }

  return tokenValues;
}

export const evaluateScore = (testExpression, items = [], scores = [], subScaleResult = {}) => {
  const parser = new Parser();

  try {
    let expression = testExpression;
    for (const variableName in subScaleResult) {
      expression = expression.replace(
        new RegExp(`\\(${variableName}\\)`, 'g'), subScaleResult[variableName].tScore ? subScaleResult[variableName].tScore : 0
      );
    }

    for (let i = 0; i < items.length; i++) {
      expression = expression.replace(
        new RegExp(`\\b${items[i].variableName}\\b`, 'g'), scores[i] ? scores[i] : 0
      );
    }

    // Run the expression
    const expr = parser.parse(expression);

    const result = expr.evaluate();
    return result;
  } catch (error) {
    console.log('error is', error);
    return null;
  }
};

export const getMaxScore = (item) => {
  if (item.inputType !== 'radio' && item.inputType !== 'slider') {
    return 0;
  }

  const valueConstraints = item.valueConstraints || {};
  const itemList = valueConstraints.itemList || [];

  const isScoring = valueConstraints.scoring || _.findIndex(itemList, obj => Boolean(obj.score)) > -1;
  if (!isScoring) {
    return 0;
  }

  const oo = 1e6;
  return itemList.reduce((previousValue, currentOption) => {
    return valueConstraints.multipleChoice ? Math.max(currentOption.score + previousValue, previousValue) : Math.max(currentOption.score, previousValue)
  }, valueConstraints.multipleChoice ? 0 : -oo);
}

const isValueInRange = (value, lookupInfo) => {
  if (!lookupInfo || lookupInfo == value) {
    return true;
  }

  const matched = lookupInfo.match(/^([\d.]+)\s*[-~]\s*([\d.]+)$/);

  if (matched) {
    value = parseInt(value);

    return !isNaN(value) && value >= Number(matched[1]) && value <= Number(matched[2]);
  }
  return false;
};

export const getScoreFromLookupTable = (
  responses,
  jsExpression,
  isAverageScore,
  items,
  lookupTable,
  subScaleResult
) => {
  let scores = [];

  for (let i = 0; i < responses.length; i++) {
    if (responses[i]) {
      scores.push(getScoreFromResponse(items[i], responses[i].value));
    }
  }

  let subScaleScore = evaluateScore(jsExpression, items, scores, subScaleResult);

  if (isAverageScore) {
    const nodes = jsExpression.split('+');
    subScaleScore /= nodes.length;
  }

  if (lookupTable) {
    const age = responses[items.findIndex(item => item.variableName === 'age_screen')];
    const genderResponse = responses[items.findIndex(item => item.variableName === 'gender_screen')]
    let gender = 'undefined';

    if (genderResponse) {
      gender = genderResponse.value ? 'F' : 'M';
    }

    for (let row of lookupTable) {
      if (
        isValueInRange(subScaleScore, row.rawScore) &&
        isValueInRange(age, row.age) &&
        isValueInRange(gender, row.sex.toUpperCase())
      ) {
        return {
          tScore: Number(row.tScore),
          outputText: row.outputText
        };
      }
    }
  }

  return {
    tScore: subScaleScore,
    outputText: null
  };
}

export const getSubScaleResult = (subScales, responses, items) => {
  const subScaleResult = {};
  const calculated = {};

  while (true) {
    let updated = false;

    for (const subScale of subScales) {
      if (!calculated[subScale.variableName]) {
        if (subScale.innerSubScales.find(name => !calculated[name])) {
          continue;
        }

        subScaleResult[subScale.variableName] =
          getScoreFromLookupTable(
            responses,
            subScale.jsExpression,
            subScale.isAverageScore,
            items,
            subScale['lookupTable'],
            subScaleResult
          );

        calculated[subScale.variableName] = true;

        updated = true;
      }
    }

    if (!updated) break;
  }

  return subScales.map(subScale => subScaleResult[subScale.variableName]);
}

export const getFinalSubScale = (responses, items, isAverage, lookupTable) => {
  let total = 0, count = 0;
  for (let i = 0; i < responses.length; i++) {
    if (responses[i]) {
      total += getScoreFromResponse(items[i], responses[i].value);
      const isScoring = items[i].valueConstraints.scoring || _.findIndex(items[i].valueConstraints.itemList, obj => Boolean(obj.score)) > -1;
      if (items[i].valueConstraints && isScoring) {
        count++;
      }
    }
  }

  const score = (isAverage ? total / Math.max(count, 1) : total);

  if (lookupTable) {
    for (let row of lookupTable) {
      if (
        isValueInRange(score, row.rawScore)
      ) {
        return {
          rawScore: score,
          outputText: row.outputText
        };
      }
    }
  }

  return {
    rawScore: score,
    outputText: ''
  }
}

export const evaluateCumulatives = (responses, activity) => {
  if (!activity.messages || !activity.compute) return { cumActivities: [] };
  const parser = new Parser({
    logical: true,
    comparison: true,
  });

  let scores = [],
    maxScores = [];
  for (let i = 0; i < activity.items.length; i++) {
    if (!activity.items[i] || !responses[i]) continue;

    let score = getScoreFromResponse(activity.items[i], responses[i]);
    scores.push(score);

    maxScores.push(getMaxScore(activity.items[i]));
  }

  const cumulativeScores = activity.compute && activity.compute.reduce((accumulator, itemCompute) => {
    return {
      ...accumulator,
      [itemCompute.variableName.trim().replace(/[\s\/]/g, "__")]: evaluateScore(
        itemCompute.jsExpression,
        activity.items,
        scores
      ),
    };
  }, {});

  const cumulativeMaxScores = activity.compute && activity.compute.reduce((accumulator, itemCompute) => {
    return {
      ...accumulator,
      [itemCompute.variableName.trim().replace(/[\s\/]/g, "__")]: evaluateScore(
        itemCompute.jsExpression,
        activity.items,
        maxScores
      ),
    };
  }, {});

  const reportMessages = [];
  let cumActivities = [];

  activity.messages.forEach(async (msg, i) => {
    const { jsExpression, message, outputType, nextActivity, hideActivity } = msg;

    const exprArr = jsExpression.split(/[><]/g);
    const variableName = exprArr[0];
    const exprValue = parseFloat(exprArr[1].split(" ")[1]);
    const category = variableName.trim().replace(/[\s\/]/g, "__");
    const expr = parser.parse(category + jsExpression.substr(variableName.length));

    const variableScores = {
      [category]:
        outputType == "percentage"
          ? Math.round(
            cumulativeMaxScores[category] ? (cumulativeScores[category] * 100) / cumulativeMaxScores[category] : 0
          )
          : cumulativeScores[category],
    };

    if (expr.evaluate(variableScores)) {
      if (nextActivity && (hideActivity || hideActivity === undefined)) cumActivities.push(nextActivity);

      const compute = activity.compute && activity.compute.find((itemCompute) => itemCompute.variableName.trim() == variableName.trim());

      reportMessages.push({
        category,
        message,
        score: variableScores[category] + (outputType == "percentage" ? "%" : ""),
        compute,
        jsExpression: jsExpression.substr(variableName.length),
        scoreValue: cumulativeScores[category],
        maxScoreValue: cumulativeMaxScores[category],
        exprValue: outputType == "percentage" ? (exprValue * cumulativeMaxScores[category]) / 100 : exprValue,
      });
    }
  });

  return { reportMessages, cumActivities }
}
