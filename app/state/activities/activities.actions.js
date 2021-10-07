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

export const setHiddenCumulativeActivities = (data) => {
  console.log('------------called------------');
  return ({
    type: "HIDDEN_CUMULATIVE_ACTIVITIES",
    payload: data,
  })
};

export const clearActivities = () => {
  return ({
    type: "CLEAR_ACTIVITIES",
  })
};
