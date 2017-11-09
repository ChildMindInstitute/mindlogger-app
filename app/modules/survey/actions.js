import * as types from './actionTypes';

export function postAnswer(index, result) {
  return {
    type: types.POST_ANSWER,
    index: index,
    data: result
  };
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