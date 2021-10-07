
export const initialState = {
  activities: [],
  cumulativeActivities: {},
  hiddenCumulativeActivities: [],
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case "SET_ACTIVITIES":
      return {
        ...state,
        activities: action.payload,
      };
    case "CUMULATIVE_ACTIVITIES":
      return {
        ...state,
        cumulativeActivities: { ...state.cumulativeActivities, ...action.payload },
      };
    case "HIDDEN_CUMULATIVE_ACTIVITIES":
      console.log('HIDDEN_CUMULATIVE_ACTIVITIES: ', action.payload);
      return {
        ...state,
        hiddenCumulativeActivities: [ ...state.hiddenCumulativeActivities, action.payload ],
      };
    case "CLEAR_ACTIVITIES":
      return { ...initialState };

    default:
      return state;
  }
};
