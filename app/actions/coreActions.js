import * as types from './actionTypes'

export const setUserLocal = (user) => ({
    type: types.SET_USER,
    data:user
})

export const updateUserLocal = (user) => ({
    type: types.UPDATE_USER,
    data:user
})

export const updateActivity = (index, data) => ({
    type: types.UPDATE_ACTIVITY,
    index,
    data,
})

export const setAnswer = (data) => ({
    type: types.SET_ANSWER,
    data
})

export const setActivity = (data) => ({
    type: types.SET_ACTIVITY,
    data
})