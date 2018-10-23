import {REHYDRATE} from 'redux-persist/constants';

import * as types from '../actions/actionTypes';
import { GET_USER_COLLECTION } from '../actions/actionTypes';

const initialState = {
};

export default function coreReducer(state = initialState, action = {}) {
    var user
    var acts
    if (action.path && action.method && action.status === 'COMPLETE') {
        switch (action.type) {
            case types.SIGN_IN:
                return {
                    ...state,
                    auth: action.response.authToken,
                    self: action.response.user,
                }
            case types.SIGN_UP:
                return {
                    ...state,
                    auth: action.response.authToken,
                    self: action.response,
                }
            case types.UPDATE_USER:
                return {
                    ...state,
                    self: action.response,
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
            case types.GET_COLLECTION:
                {
                    let collection = state.collection || {};
                    collection[action.name.toLowerCase()] = action.response[0];
                    return {
                        ...state,
                        collection,
                    }
                }
                break;
            case types.LIST_OBJECTS:
                {
                    let newState = state;
                    if (action.name) {
                        let data = state[action.objectType] || {};
                        data[action.name] = action.response;
                        newState[action.objectType] = data;
                    }
                    let data = state.data || {};
                    let tree = state.tree || {};
                    let ids = [];
                    action.response.forEach(obj => {
                        let id = `${action.objectType}/${obj._id}`;
                        data[id] = obj;
                        ids.push(id);
                    });
                    tree[`${action.parentType}/${action.parentId}`] = ids;
                    return {
                        ...newState,
                        data,
                        tree,
                    };
                }
            case types.GET_OBJECT:
                {
                    let data = state.data || {};
                    data[action.response._id] = action.response;
                    return {
                        ...state,
                        data,
                    }
                }
            case types.GET_NAMES_HASH:
                {
                    let objects = state.objects || {};
                    let key = `${action.parentType}/${action.parentId}`;
                    let dict = objects[key] || {};
                    let arr = action.response;
                    arr.forEach(obj => {
                        dict[`${action.objectType}/${obj.name}`] = obj;
                    });
                    objects[key] = dict;
                    return {
                        ...state,
                        objects,
                    }
                }
            case types.FETCH_OBJECT:
                {
                    let data = state.data || {};
                    data[action.objectPath] = action.response;
                    return {
                        ...state,
                        data,
                    }
                }
            case types.GET_ACT:
                {
                    let actData = state.actData || {};
                    let info;
                    let variant;
                    action.response.forEach(v => {
                        if (v.meta && v.meta.info) {
                            info = v;
                        } else {
                            variant = v;
                        }
                    })
                    actData[action.actId] = {
                        variant,
                        info
                    }
                    
                    return {
                        ...state,
                        actData,
                    }
                }
            case GET_USER_COLLECTION:
                {
                    const userData = state.userData || {};
                    let curUserData = userData[action.userId] || {};
                    const collections = {};
                    action.response.forEach(v => {
                        collections[v.name] = v;
                    });
                    curUserData = {
                        ...curUserData,
                        collections
                    }
                    userData[action.userId] = curUserData;
                    return {
                        ...state,
                        userData,
                    }
                }
            default:
                return {
                    ...state,
                }

        }
        
    } else {
        switch (action.type) {
            case REHYDRATE:
                const core = action.payload.core
                if(core)
                    return {...state, ...core}
                else
                    return state;
            case types.SIGN_OUT:
                return {
                    ...state,
                    volumes: [],
                    auth: false
                }
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
                {
                    let answerData = state.answerData || {};
                    answerData[state.act._id] = action.data;
                    return {
                        ...state,
                        answerData,
                    }
                }
                
            case types.SET_ACTIVITY:
                if(state.act && action.data.id != state.act.id)
                    return {
                        ...state,
                        act: action.data,
                        actInfo: action.meta.info,
                        actOptions: action.meta.options,
                        answer: undefined
                    }
                else
                    return {
                        ...state,
                        actInfo: action.meta.info,
                        act: action.data,
                        actOptions: action.meta.options,
                    }
            case types.SET_DATA:
                return {
                    ...state,
                    ...action.data,
                }
            default:
                return state;
        }
    }
}
