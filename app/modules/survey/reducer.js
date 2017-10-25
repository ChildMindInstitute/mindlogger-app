import {REHYDRATE} from 'redux-persist/constants';
import * as types from './actionTypes';

const surveyInitialState = {
  questions: [],
  answers: [],
};

const initialState = {
  surveys: [],
}
export default function surveysReducer(state = initialState, action = {}) {
  let surveys = [...state.surveys]
  switch (action.type) {
    case REHYDRATE:
      const survey = action.payload.survey
      if(survey) 
        return {...state, ...survey}
      else
        return state
    case types.ADD_SURVEY:
      surveys.push({...action.data, ...surveyInitialState})
      return {
        ...state,
        surveys
      }
    case types.UPDATE_SURVEY:
      surveys[action.index] ={ ...surveys[action.index], ...action.data}
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
      return {
        ...state,
        survey_in_action: action.data
      }
      break;
    default:
      return state;
  }
}
