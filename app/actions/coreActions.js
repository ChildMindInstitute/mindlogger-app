import types from './actionTypes'

export const setUserLocal = (user) => ({
    type: types.SET_USER,
    user
})

export const updateUserLocal = (user) => ({
    type: types.UPDATE_USER,
    user
})