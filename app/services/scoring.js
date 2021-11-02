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

export const getBehaviorTokensFromResponse = (item, response) => {
  const { positiveBehaviors, negativeBehaviors } = item.valueConstraints;
  const { value } = (response || {});

  let token = 0;

  if (!value) {
    return 0
  }

  const isBehaviorFilledOut = (list) => {
    if (!list.length) return false;
    for (const item of list) {
      if (!item.time || item.distress === null || item.impairment === null ) {
        return false;
      }
    }

    return true;
  }

  for (const behavior of positiveBehaviors) {
    const list = response[behavior.name] || []
    token += behavior.value * list.length;

    if (isBehaviorFilledOut(list)) {
      token++;
    }
  }

  for (const behavior of negativeBehaviors) {
    const list = response[behavior.name] || []
    token -= behavior.value * list.length;

    if (isBehaviorFilledOut(list)) {
      token++;
    }
  }

  return token;
}

export const getTokenIncreaseForBehaviors = (item, tokenTimes, refreshTime, responses) => {
  let result = 0;

  const { negativeBehaviors, positiveBehaviors } = item.valueConstraints;
  const timestamp = refreshTime.getTime(), day = 24 * 3600 * 1000
  const times = tokenTimes.map(time => new Date(time).getTime()).sort()

  const getTokens = (behavior, positive=true) => {
    let count = 0, reward = 0;

    for (const response of responses) {
      const time = new Date(response.datetime).getTime()
      if (time >= timestamp - day && time < timestamp) {
        const data = response.value[behavior.name] || [];
        count += data.length;

        if (data.length && data.every(d => d.distress !== null && d.impairment !== null && d.time)) {
          reward++;
        }
      }
    }

    return count * behavior.value * ( positive ? 1 : -1 ) + reward;
  }

  for (const behavior of positiveBehaviors) {
    result += getTokens(behavior);
  }

  const getTrackedMinutes = (startTime, endTime, date) => {
    if (startTime <= endTime) return 0;

    for (const time of times) {
      if (time >= date + startTime && time < date + endTime) {
        return (date + endTime - time) / 60 / 1000;
      }
    }

    return 0;
  }

  const getMilliseconds = (timeStr) => {
    const parts = timeStr.split(':')
    return Number(parts[0]) * 60 * 1000 + Number(parts[1]) * 1000
  }

  for (const behavior of negativeBehaviors ) {
    let reward = getTokens(behavior, false);

    let { startTime, endTime, rate, value } = behavior;

    startTime = getMilliseconds(startTime);
    endTime = getMilliseconds(endTime);

    const today = timestamp - 3 * 3600 * 1000;

    let duration = getTrackedMinutes( // 3am yesterday to 12am today
      Math.max(3 * 3600 * 1000, startTime), endTime, today - day
    ) + getTrackedMinutes(  // 12am today to 3am today
      startTime, Math.min(endTime, 3 * 3600 * 1000), today
    );

    reward += value * duration / rate;

    if (reward < 0) {
      reward = 0;
    }

    result += Math.round(reward);
  }

  return result;
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