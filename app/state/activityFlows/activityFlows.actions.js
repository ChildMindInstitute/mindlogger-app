export const setActivityFlows = (data) => {
  return ({
    type: "SET_ACTIVITY_FLOWS",
    payload: data,
  })
};

export const clearActivityFlows = () => {
  return ({
    type: "CLEAR_ACTIVITY_FLOWS",
  })
};
