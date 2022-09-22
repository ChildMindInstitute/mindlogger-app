import { evaluateReports } from "./scoring";

const getAlertsFromOptionList = (itemList, value) => {
  let response = value;
  const alerts = [];

  if (value === undefined || value === null) {
    return [];
  }

  if (typeof response == 'number' || typeof response == 'string') {
      response = [response];
  }

  for (let value of response) {
    let option = itemList.find(option => 
      typeof value == 'number' && option.value === value || 
      typeof value == 'string' && Object.values(option.name)[0] === value.split(':')[0]
    );

    if (option && option.alert) {
      alerts.push(option.alert);
    }
  }

  return alerts;
}

const getAlertFromContinuousSlider = (sliderConstraint, value) => {
  const { minAlertValue, maxAlertValue, responseAlertMessage } = sliderConstraint;

  if (value >= minAlertValue && value < maxAlertValue) {
    return [responseAlertMessage];
  }

  return [];
}

export const getAlertsFromResponse = (item, value) => {
  if (value === null || value === undefined || item.inputType !== 'radio' && item.inputType !== 'slider' && item.inputType !== 'stackedRadio' && item.inputType !== 'stackedSlider') {
      return [];
  }

  const valueConstraints = item.valueConstraints || {};

  if (item.inputType == 'radio' || item.inputType == 'slider' && !valueConstraints.continousSlider) {
    const itemList = valueConstraints.itemList || [];
    return getAlertsFromOptionList(itemList, value);
  }

  if (item.inputType == 'slider' && valueConstraints.continousSlider) {
    return getAlertFromContinuousSlider(valueConstraints, value);
  }

  if (item.inputType == 'stackedRadio') {
    let alerts = [];
    let optionCount = valueConstraints.options.length;

    for (let i = 0; i < valueConstraints.itemList.length; i++) {
      const itemOptions = valueConstraints.itemOptions.slice(i * optionCount, (i+1) * optionCount).map((option, index) => ({
        ...option,
        name: valueConstraints.options[index].name
      }));

      alerts = alerts.concat(
        getAlertsFromOptionList(itemOptions, value[i])
      );
    }
    return alerts;
  }

  if (item.inputType == 'stackedSlider') {
    let alerts = [];

    for (let i = 0; i < valueConstraints.sliderOptions.length; i++) {
      const slider = valueConstraints.sliderOptions[i];
      alerts = alerts.concat(
        getAlertsFromOptionList(slider.itemList, value[i])
      );
    }

    return [];
  }
}

export const getSummaryScreenDataForActivity = (activity, currentActivityId, responseHistory, responses) => {
  const result = {
    alerts: [], 
    reports: [],
    hasData: function() {
      return !!this.alerts.length || !!this.reports.length;
    }
  }
  
  if (activity.summaryDisabled) {
    return result;
  }

  let lastResponse = [];
  if (activity.id == currentActivityId) {
    lastResponse = responses;
  } else {
    for (let item of activity.items) {
      const itemResponses = responseHistory.responses[item.schema];

      if (itemResponses && itemResponses.length) {
        lastResponse.push(itemResponses[itemResponses.length-1]);
      } else {
        lastResponse.push(null);
      }
    }
  }

  result.reports.push({
    activity,
    data: evaluateReports(lastResponse, activity)
  });

  for (let i = 0; i < lastResponse.length; i++) {
    const item = activity.items[i];

    if (item.valueConstraints) {
      const { responseAlert } = item.valueConstraints;
      if (lastResponse[i] !== null && lastResponse[i] !== undefined && responseAlert) {
        const messages = getAlertsFromResponse(item, lastResponse[i].value !== undefined ? lastResponse[i].value : lastResponse[i]);
        result.alerts = result.alerts.concat(messages);
      }
    }
  }

  result.reports = result.reports.filter(report => report.data.length > 0);
  return result;
}