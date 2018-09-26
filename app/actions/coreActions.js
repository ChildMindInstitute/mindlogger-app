import * as types from './actionTypes'

export const setUserLocal = (user) => ({
    type: types.SET_USER,
    data:user
});

export const updateUserLocal = (user) => ({
    type: types.UPDATE_USER,
    data:user
});

export const updateActivity = (index, data) => ({
    type: types.UPDATE_ACTIVITY,
    index,
    data,
});

export const setAnswer = (data) => ({
    type: types.SET_ANSWER,
    data
});

export const setActivity = (data, info) => ({
    type: types.SET_ACTIVITY,
    data,
    info
});

export const setVolume = (volume) => ({
    type: types.SET_DATA,
    data: { volume }
});

export const setVolumes = (volumes) => ({
    type: types.SET_DATA,
    data: { volumes }
});

export const setDataObject = (object) => ({
    type: types.SET_DATA_OBJECT,
    object
});

export const setActChanged = (actChanged) => ({
    type: types.SET_DATA,
    data: { actChanged }
})

export const setNotificationStatus = (notifications) => ({
    type: types.SET_DATA,
    data: { notifications, checkedTime: Date.now() }
})