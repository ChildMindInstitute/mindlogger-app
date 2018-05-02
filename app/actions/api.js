
import {saveUserLocal} from './coreActions'
import * as types from './actionTypes'
import { Platform } from 'react-native';

export const signUp = (body) => ({
    type: types.SIGN_UP,
    method: 'POST',
    path: '/user',
    body,
});

export const changePassword = (body) => ({
    type: types.CHANGE_PASSWORD,
    method: 'POST',
    path: '/user/change-password',
    body,
});

export const signIn = (body) => ({
    type: types.SIGN_IN,
    method: 'POST',
    path: '/login',
    body,
});

export const signOut = (body) => ({
    type: types.SIGN_OUT,
    method: 'DELETE',
    path: '/logout',
})

export const updateUser = (body) => ({
    type: types.UPDATE_USER,
    method: 'PUT',
    path: '/user',
    body,
})

export const forgotPassword = (body) => ({
    type: types.FORGOT_PASSWORD,
    method: 'POST',
    path: '/user/forgot-password',
    body,
});

// Acts

export const getActs = () => ({
    type: types.GET_LIST,
    method: 'GET',
    path: '/acts'
})

export const getAssignedActs = () => ({
    type: types.GET_ASSIGNED_ACTS,
    method: 'GET',
    path: '/users/me/assigned_acts'
})

export const addAct = (body) => ({
    type: types.ADD_ACT,
    method: 'POST',
    path: '/acts',
    body
})

export const updateAct = (index, {id, ...body}) => ({
    type: types.UPDATE_ACT,
    method: 'PUT',
    index,
    path: `/acts/${id}`,
    body
})

export const deleteAct = (index, act) => ({
    type: types.DELETE_ACT,
    method: 'DELETE',
    index,
    path: `/acts/${act.id}`
})

// Answers

export const saveAnswer = (actId, actData, answerData) => ({
    type: types.SAVE_ANSWER,
    method: 'POST',
    path: '/answers',
    body: {
        act_id:actId,
        act_data:actData,
        answer_data:answerData,
        platform: Platform.OS
    }
})

// Files

export const getFiles = (path) => ({
    type: types.GET_LIST,
    method: 'GET',
    path: `/files?path=${path}`
})