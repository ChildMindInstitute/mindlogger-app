import _ from "lodash";

export const initialState = {
  activities: [],
  recommendedActivities: [],
  cumulativeActivities: {},
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case "SET_ACTIVITIES":
      return {
        ...state,
        activities: action.payload,
      };
    case "SET_RECOMMENDED_ACTIVITIES":
      return {
        ...state,
        recommendedActivities: action.payload,
      };
    case "CUMULATIVE_ACTIVITIES":
      return {
        ...state,
        cumulativeActivities: { ...action.payload },
      };
    case "CLEAR_ACTIVITIES":
      return { ...initialState };

    default:
      return state;
  }
};
