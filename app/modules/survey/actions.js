import * as types from './actionTypes';

import questionData from './dummy_data'

export function getQuestions() {
  return {
    type: types.GET_QUESTIONS,
    response: { data: questionData }
  };
}

export function postAnswer(index, result) {
  return {
    type: types.POST_ANSWER,
    index: index,
    data: result
  };
}