import * as types from './actionTypes';

const initialState = {
  questions: [],
  answers: {}
};

export default function questions(state = initialState, action = {}) {
  switch (action.type) {
    case types.GET_QUESTIONS:
      return {
        ...state,
        questions: (action.response && action.response.data)
      };
    case types.POST_ANSWER:
      let newState = {
        ...state
      }
      newState.answers[action.index] = action.data
      console.log(newState)
      return newState

    default:
      return state;
  }
}
