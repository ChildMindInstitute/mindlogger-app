
export const initialState = {
  activities: [],
  cumulativeActivities: {}
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

    default:
      return state;
  }
};
