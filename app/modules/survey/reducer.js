import {REHYDRATE} from 'redux-persist/constants';
import * as types from './actionTypes';
import randomString from 'random-string';
const surveyInitialState = {
  questions: [],
  answers: [],
};

const initialState = {
  surveys: [],
}
export default function surveysReducer(state = initialState, action = {}) {
  let surveys = [...state.surveys]
  let data = action.data
  let currentTime = (new Date()).getTime()
  switch (action.type) {
    case REHYDRATE:
      const survey = action.payload.survey
      if(survey) 
        return {...state, ...survey}
      else
        return state
    case types.LOAD_SURVEYS:
      return {...state, surveys: action.data}
    case types.ADD_SURVEY:
      surveys.push({...action.data, ...surveyInitialState, uuid: randomString({length:20})})
      return {
        ...state,
        surveys
      }
    case types.UPDATE_SURVEY:
      data.updated_at = currentTime
      surveys[action.index] ={ ...surveys[action.index], ...data}
      return {
        ...state,
        surveys
      }
    case types.DELETE_SURVEY:
      surveys.splice(action.index,1)
      return {
        ...state,
        surveys
      }
    case types.SET_SURVEY:
      data = action.data
      data.updated_at = currentTime
      return {
        ...state,
        survey_in_action: data
      }
      break;
    default:
      return state;
  }
}
