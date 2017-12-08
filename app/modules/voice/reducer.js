import {REHYDRATE} from 'redux-persist/constants';
import * as types from './actionTypes';
import randomString from 'random-string';

const activityInitialState = {
};

const initialState = {
  voices: [],
}
export default function voiceReducers(state = initialState, action = {}) {
  let voices = [...state.voices]
  switch (action.type) {
    case REHYDRATE:
      const voice = action.payload.voice
      if(voice) 
        return {...state, ...voice}
      else
        return state
    case types.LOAD_VOICES:
      return {...state, voices: action.data}
    case types.ADD_VOICE:
      voices.push({...action.data, ...activityInitialState, uuid: randomString({length:20})})
      return {
        ...state,
        voices
      }
    case types.UPDATE_VOICE:
      voices[action.index] ={ ...voices[action.index], ...action.data}
      console.log("UPDATE", voices)
      return {
        ...state,
        voices
      }
    case types.DELETE_VOICE:
      voices.splice(action.index,1)
      return {
        ...state,
        voices
      }
    case types.SET_VOICE:
        console.log("SET", action.data)
        return {
            ...state,
            voice_in_action: action.data
        }
    default:
      return state;
  }
}
