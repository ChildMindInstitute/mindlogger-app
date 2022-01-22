
export const updateTrackerAggregation = (aggregation, id, response) => {
  aggregation[id] = aggregation[id] || {};

  for (const option in response) {
    aggregation[id][option] = aggregation[id][option] || {};

    let {
      count = 0,
      distress = { total: 0, count: 0 },
      impairment = { total: 0, count: 0 }
    } = aggregation[id][option];

    distress = response[option].reduce((prev, d) => {
      if (d.distress === null) {
        return prev;
      }

      return { total: prev.total + d.distress, count: prev.count + 1 }
    }, distress)

    impairment = response[option].reduce((prev, d) => {
      if (d.impairment === null) {
        return prev;
      }

      return { total: prev.total + d.impairment, count: prev.count + 1 }
    }, impairment)

    aggregation[id][option] = { count: count + response[option].length, distress, impairment }
  }
}

export const getTokenIncreaseForNegativeBehaviors = (item, tokenTimes, refreshTime, responses) => {
  let result = 0;

  const { negativeBehaviors } = item.valueConstraints;
  const timestamp = refreshTime.getTime(), day = 24 * 3600 * 1000
  const times = tokenTimes.map(time => new Date(time).getTime()).sort()


  const getMilliseconds = (timeStr) => {
    const parts = timeStr.split(':')
    return (Number(parts[0]) * 60 + Number(parts[1])) * 60 * 1000
  }

  const getTrackedTime = (startTime, endTime, date) => {
    if (startTime >= endTime) return 0;

    const timeRanges = [];
    let last = null, totalTime = 0;

    for (const time of times) {
      const start = Math.max(time, startTime + date), end = Math.min(time + day, endTime + date);

      if (start < end) {
        if (last && last.end >= start) {
          last.end = Math.max(last.end, end);
        } else {
          last = { start, end };
          timeRanges.push(last);
        }
      }
    }

    for (const range of timeRanges) {
      totalTime += range.end - range.start;
    }

    return totalTime;
  }

  const today = timestamp - 3 * 3600 * 1000;

  for (const behavior of negativeBehaviors ) {
    let reward = 0;

    // all negative behaviors reduces 1 TV per occurrence
    for (const response of responses) {
      const time = new Date(response.datetime).getTime()
      if (time >= timestamp - day && time < timestamp) {
        const data = response.value[behavior.name] || [];
        reward -= data.length * behavior.value;
      }
    }

    let { startTime, endTime } = behavior;

    startTime = getMilliseconds(startTime);
    endTime = getMilliseconds(endTime) + 60 * 1000;

    let totalTime = 0;
    // calculate negative behaviors according to rule
    if (startTime < endTime) {
      totalTime += getTrackedTime(Math.max(3 * 3600 * 1000, startTime), endTime, today - day);
      totalTime += getTrackedTime(startTime, Math.min(endTime, 3 * 3600 * 1000), today)
    } else {
      totalTime += getTrackedTime(3 * 3600 * 1000, endTime, today-day);
      totalTime += getTrackedTime(Math.max(3 * 3600 * 1000, startTime), day, today - day);
      totalTime += getTrackedTime(0, Math.min(3 * 3600 * 1000, endTime), today);
    }

    reward += Math.floor(totalTime / (behavior.rate * 60 * 1000)) * behavior.value;

    result += reward;
  }

  return Math.max(result, 0);
}

export const getTokenSummary = (activity, responses) => {
  const options = [];
  let timeReward = 0, timeLimit = 0, trackingBehaviors = 0, backgroundTokens = 0;

  const parseResponse = (response, behavior) => {
    let count = 0, reward = 0;

    if (response && response[behavior.name]) {
      for (const data of response[behavior.name]) {
        count++;
        if (data.time && data.distress !== null & data.impairment !== null) {
          reward++;
        }
      }
    }

    return { count, reward }
  }

  for (let i = 0; i < activity.items.length; i++) {
    const item = activity.items[i];
    const response = (responses[i] || {}).value;

    if (item.inputType == 'futureBehaviorTracker' || item.inputType == 'pastBehaviorTracker') {
      const { negativeBehaviors, positiveBehaviors, timeScreen } = item.valueConstraints;

      if (timeScreen && item.inputType == 'futureBehaviorTracker') {
        const timeIndex = activity.items.findIndex(item => item.variableName == timeScreen);
        const timeResponse = (responses[timeIndex] || {}).value;

        timeReward += Math.max(2, 2 * Math.floor((responses[i].timeLimit - responses[i].timeLeft) / 60000 / 5));
        timeLimit = timeResponse || 0;
      } else {
        timeReward += 2;
      }

      for (const behavior of positiveBehaviors) {
        options.push({
          ...behavior,
          type: 'positive',
          ...parseResponse(response, behavior)
        })
      }

      for (const behavior of negativeBehaviors) {
        options.push({
          ...behavior,
          type: 'negative',
          ...parseResponse(response, behavior)
        })
      }
    }
  }

  for (const option of options) {
    if (option.type == 'positive') {
      trackingBehaviors += option.value * option.count;
    }

    backgroundTokens += option.reward;
  }

  return {
    options,
    timeReward,
    timeLimit,
    trackingBehaviors,
    backgroundTokens,
    total: timeReward + trackingBehaviors + backgroundTokens
  }
}

export const isTokenLoggerApplet = (applet) => {
  for (const activity of applet.activities) {
    for (const item of activity.items) {
      if (item.inputType == 'pastBehaviorTracker' || item.inputType == 'futureBehaviorTracker') {
        return true;
      }
    }
  }

  return false;
}
