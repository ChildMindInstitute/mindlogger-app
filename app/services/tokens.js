
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

  const getTokens = (behavior) => {
    let count = 0;

    for (const response of responses) {
      const time = new Date(response.datetime).getTime()
      if (time >= timestamp - day && time < timestamp) {
        const data = response.value[behavior.name] || [];
        count += data.length;
      }
    }

    return count * behavior.value * -1;
  }

  const getTrackedMinutes = (startTime, endTime, date) => {
    if (startTime >= endTime) return 0;

    for (const time of times) {
      if (time >= date + startTime && time < date + endTime) {
        return (date + endTime - time) / 60 / 1000;
      }
    }

    return 0;
  }

  const getMilliseconds = (timeStr) => {
    const parts = timeStr.split(':')
    return (Number(parts[0]) * 60 + Number(parts[1])) * 60 * 1000
  }

  for (const behavior of negativeBehaviors ) {
    let reward = getTokens(behavior);

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

      if (count == reward) {
        reward++;
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
