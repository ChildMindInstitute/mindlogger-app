import {REHYDRATE} from 'redux-persist/constants';
import * as types from './actionTypes';
import randomString from 'random-string';

const activityInitialState = {
};

const initialState = {
  drawings: [],
}
export default function drawingReducers(state = initialState, action = {}) {
  let drawings = [...state.drawings]
  switch (action.type) {
    case REHYDRATE:
      const drawing = action.payload.drawing
      if(drawing) 
        return {...state, ...drawing}
      else
        return state
    case types.LOAD_DRAWINGS:
      return {...state, drawings: action.data}
    case types.ADD_DRAWING:
      drawings.push({...action.data, ...activityInitialState, uuid: randomString({length:20})})
      return {
        ...state,
        drawings
      }
    case types.UPDATE_DRAWING:
      drawings[action.index] ={ ...drawings[action.index], ...action.data}
      return {
        ...state,
        drawings
      }
    case types.DELETE_DRAWING:
      drawings.splice(action.index,1)
      return {
        ...state,
        drawings
      }
    case types.SET_DRAWING:
        console.log("SET", action.data)
        return {
            ...state,
            drawing_in_action: action.data
        }
    default:
      return state;
  }
}
