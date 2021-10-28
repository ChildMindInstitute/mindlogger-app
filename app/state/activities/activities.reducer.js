import _ from "lodash";

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
      let hiddenCumulativeActivities = [...state.hiddenCumulativeActivities];
      if (action.payload.isRemove) {
        _.remove(hiddenCumulativeActivities, val => val === action.payload.data)
      } else
        hiddenCumulativeActivities = [...hiddenCumulativeActivities, action.payload.data];
      return {
        ...state,
        hiddenCumulativeActivities,
      };
    case "CLEAR_ACTIVITIES":
      return { ...initialState };

    default:
      return state;
  }
};
