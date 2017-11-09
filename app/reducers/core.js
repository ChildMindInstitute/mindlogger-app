import * as types from '../actions/actionTypes';

const initialState = {
};

export default function core(state = initialState, action = {}) {
    var user
    switch (action.type) {
        case types.SET_USER:
            user = action.data
            return {
                ...state,
                user
            };
        case types.UPDATE_USER:
            user = {...state.user, ...action.data}
            return {
                ...state,
                user
            };
        default:
            return state;
    }
}
