
export const initialState = {
  activities: []
};

export default (state = initialState, action = {}) => {
  console.log(action);
  switch (action.type) {
    case "SET_ACTIVITIES":
      return {
        ...state,
        activities: action.payload,
      };

    default:
      return state;
  }
};
