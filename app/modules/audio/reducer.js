import {REHYDRATE} from 'redux-persist/constants';
import * as types from './actionTypes';
import randomString from 'random-string';

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
      audios.push({...action.data, ...activityInitialState, uuid: randomString({length:20})})
      return {
        ...state,
        audios
      }
    case types.UPDATE_AUDIO:
      audios[action.index] ={ ...audios[action.index], ...action.data}
      console.log("UPDATE", audios)
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
        console.log("SET", action.data)
        return {
            ...state,
            audio_in_action: action.data
        }
    default:
      return state;
  }
}
