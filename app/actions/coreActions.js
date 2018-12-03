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

export const setActivity = (data, info, options) => ({
    type: types.SET_ACTIVITY,
    data,
    meta: {
        info,
        options
    }
});

export const setVolume = (volume) => ({
    type: types.SET_DATA,
    data: { volume }
});

export const setVolumes = (volumes) => ({
    type: types.SET_DATA,
    data: { volumes }
});

export const setActs = (acts) => ({
    type: types.SET_DATA,
    data: { acts }
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

export const clearNotificationStatus = (notifications) => ({
    type: types.SET_DATA,
    data: { notifications: {}, checkedTime: undefined }
})

export const addQueue = (name, payload, volumeName, collectionId) => ({
    type: types.ADD_QUEUE,
    data: {
        name,
        payload,
        volumeName,
        collectionId
    }
})

export const updateQueue = (answerCache) => ({
    type: types.SET_DATA,
    data: { answerCache }
})