import _ from "lodash";

export const initialState = {
  activityFlows: [],
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case "SET_ACTIVITY_FLOWS":
      return {
        ...state,
        activityFlows: action.payload,
      };
    case "CLEAR_ACTIVITY_FLOWS":
      return { ...initialState };

    default:
      return state;
  }
};
