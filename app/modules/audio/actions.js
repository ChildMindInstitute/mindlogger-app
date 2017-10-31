import * as types from './actionTypes';

export const addAudioActivity = (data) => ({
  type: types.ADD_AUDIO,
  data
})

export const updateAudioActivity = (index, data) => ({
  type: types.UPDATE_AUDIO,
  index: index,
  data
})

export const deleteAudioActivity = (index) => ({
  type: types.DELETE_AUDIO,
  index
})

export const setAudio = (data) => ({
  type: types.SET_AUDIO,
  data
})