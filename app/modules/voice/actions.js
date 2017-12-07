import * as types from './actionTypes';

export const addVoiceActivity = (data) => ({
  type: types.ADD_VOICE,
  data
})

export const updateVoiceActivity = (index, data) => ({
  type: types.UPDATE_VOICE,
  index: index,
  data
})

export const deleteVoiceActivity = (index) => ({
  type: types.DELETE_VOICE,
  index
})

export const setVoice = (data) => ({
  type: types.SET_VOICE,
  data
})