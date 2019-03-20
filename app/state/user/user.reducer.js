import USER_CONSTANTS from './user.constants';

export const initialState = {
  responseCollectionId: null,
  auth: null,
  info: null,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case USER_CONSTANTS.CLEAR:
      return initialState;
    case USER_CONSTANTS.SET_RESPONSE_COLLECTION_ID:
      return {
        ...state,
        responseCollectionId: action.payload,
      };
    case USER_CONSTANTS.SET_AUTH:
      return {
        ...state,
        auth: action.payload,
      };
    case USER_CONSTANTS.SET_INFO:
      return {
        ...state,
        info: action.payload,
      };
    default:
      return state;
  }
};
