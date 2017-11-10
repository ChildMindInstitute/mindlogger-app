import {REHYDRATE} from 'redux-persist/constants';

import * as types from '../actions/actionTypes';

const initialState = {
};

export default function coreReducer(state = initialState, action = {}) {
    var user
    switch (action.type) {
        case REHYDRATE:
            const core = action.payload.core
            if(core)
                return {...state, ...core}
            else
                return state
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
