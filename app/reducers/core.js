import {REHYDRATE} from 'redux-persist/constants';

import * as types from '../actions/actionTypes';

const initialState = {
};

export default function coreReducer(state = initialState, action = {}) {
    var user
    var acts
    if (action.path && action.method && action.status === 'COMPLETE') {
        switch (action.type) {
            case types.SIGN_IN:
            case types.SIGN_UP:
            case types.UPDATE_USER:
                return {
                    ...state,
                    auth: action.response.user
                }
            case types.LOG_OUT:
                return {
                    ...state,
                    auth: false
                }
            case types.ADD_ACT:
                acts = [...state.acts]
                acts.unshift(action.response.act)
                return {
                    ...state,
                    acts,
                }
            case types.UPDATE_ACT:
                acts = [...state.acts]
                acts[action.index] = {...acts[action.index], ...action.body}
                return {
                    ...state,
                    acts
                }
            case types.SAVE_ANSWER:
                return {
                    ...state,
                    answer:undefined
                }
            case types.DELETE_ACT:
                acts = [...state.acts]
                acts.splice(action.index,1)
                return {
                    ...state,
                    acts
                }
            case types.GET_ASSIGNED_ACTS:
                acts = action.response.assigned_acts
                return {
                    ...state,
                    acts
                }
            default:
              return {
                  ...state,
                  ...action.response
              }

        }
        
    } else {
        switch (action.type) {
            case REHYDRATE:
                const core = action.payload.core
                if(core)
                    return {...state, ...core}
                else
                    return state
            case types.SET_USER:
                user = action.data
                console.log(user)
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
            case types.UPDATE_ACTIVITY:
                acts = state.acts
                act = acts[action.index]
                acts[action.index] = { ...act, ...action.data}
                return {
                    ...state,
                    acts
                }
            case types.SET_ANSWER:
                return {
                    ...state,
                    answer: action.data
                }
            case types.SET_ACTIVITY:
                if(state.act && action.data.id != state.act.id)
                    return {
                        ...state,
                        act:action.data,
                        answer: undefined
                    }
                else
                    return {
                        ...state,
                        act: action.data
                    }
            default:
                return state;
        }
    }
}
