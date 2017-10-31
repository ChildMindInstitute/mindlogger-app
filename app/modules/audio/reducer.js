import {REHYDRATE} from 'redux-persist/constants';
import * as types from './actionTypes';

const activityInitialState = {
};

const initialState = {
  audios: [],
}
export default function audioReducers(state = initialState, action = {}) {
  let audios = state.audios
  switch (action.type) {
    case REHYDRATE:
      const audio = action.payload.audio
      if(audio) 
        return {...state, ...audio}
      else
        return state
    case types.ADD_AUDIO:
      audios.push({...action.data, ...activityInitialState})
      return {
        ...state,
        audios
      }
    case types.UPDATE_AUDIO:
      audios[action.index] ={ ...audio[action.index], ...action.data}
      return {
        ...state,
        audios
      }
    case types.DELETE_AUDIO:
      audios.splice(action.index,1)
      return {
        ...state,
        audios
      }
    case types.SET_AUDIO:
      return {
        ...state,
        audio_in_action: action.data
      }
      break;
    default:
      return state;
  }
}
