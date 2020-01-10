import * as R from 'ramda';
import MEDIA_CONSTANTS from './media.constants';

export const initialState = {
  mediaMap: {},
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case MEDIA_CONSTANTS.CLEAR_MEDIA_FILES:
      return {
        ...state,
        mediaMap: {},
      };
    case MEDIA_CONSTANTS.ADD_MEDIA_FILE:
      return {
        ...state,
        mediaMap: R.assoc(action.payload.uri, action.payload.filePath, state.mediaMap),
      };
    case MEDIA_CONSTANTS.REMOVE_MEDIA_FILE:
      return {
        ...state,
        mediaMap: R.dissoc(action.payload, state.mediaMap),
      };
    default:
      return state;
  }
};
