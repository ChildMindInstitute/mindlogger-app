export const setActivities = (data) => {
  return ({
    type: "SET_ACTIVITIES",
    payload: data,
  })
};

export const setCumulativeActivities = (data) => {
  return ({
    type: "CUMULATIVE_ACTIVITIES",
    payload: data,
  })
};

export const clearActivities = () => {
  return ({
    type: "CLEAR_ACTIVITIES",
  })
};

export const setActivityFlowOrderIndex = (data) => {
  return ({
    type: "SET_ACTIVITY_FLOW_INDEX_ORDER",
    payload: data,
  })
}

export const setActivityFlowOrderIndexList = (data) => {
  return ({
    type: "SET_ACTIVITY_FLOW_INDEX_ORDER_LIST",
    payload: data,
  })
}