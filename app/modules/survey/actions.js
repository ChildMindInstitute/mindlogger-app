import * as types from './actionTypes';

export function loadSurveys(data) {
  return {
    type: types.LOAD_SURVEYS,
    data
  }
}

export const addSurvey = (data) => ({
  type: types.ADD_SURVEY,
  data
})

export const updateSurvey = (index, data) => ({
  type: types.UPDATE_SURVEY,
  index: index,
  data
})

export const deleteSurvey = (index) => ({
  type: types.DELETE_SURVEY,
  index
})

export const setSurvey = (data) => ({
  type: types.SET_SURVEY,
  data
})