import USER_CONSTANTS from './user.constants';

export const initialState = {
  responseCollectionId: null,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case USER_CONSTANTS.SET_RESPONSE_COLLECTION_ID:
      return {
        ...state,
        responseCollectionId: action.payload,
      };
    default:
      return state;
  }
};
