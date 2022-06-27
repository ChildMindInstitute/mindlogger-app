import _ from "lodash";

export const initialState = {
  activities: [],
  recommendedActivities: [],
  cumulativeActivities: {},
  orderIndex: {},
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
        cumulativeActivities: { ...action.payload },
      };
    case "SET_ORDER_INDEX":
      return {
        ...state,
      };
    case "CLEAR_ACTIVITIES":
      return { ...initialState };
    
    case "SET_ACTIVITY_FLOW_INDEX_ORDER":
      const { activityId, index } = action.payload;
      return {
        ...state,
        orderIndex: { ...state.orderIndex, [activityId]: index }
      }

    default:
      return state;
  }
};
