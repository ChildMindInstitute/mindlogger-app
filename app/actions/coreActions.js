import * as types from './actionTypes'

export const setUserLocal = (user) => ({
    type: types.SET_USER,
    data:user
})

export const updateUserLocal = (user) => ({
    type: types.UPDATE_USER,
    data:user
})