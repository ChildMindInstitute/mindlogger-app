import * as types from './actionTypes';

export const loadVoices = (data) => ({
  type: types.LOAD_VOICES,
  data
})

export const addVoice = (data) => ({
  type: types.ADD_VOICE,
  data
})

export const updateVoice = (index, data) => ({
  type: types.UPDATE_VOICE,
  index: index,
  data
})

export const deleteVoice = (index) => ({
  type: types.DELETE_VOICE,
  index
})

export const setVoice = (data) => ({
  type: types.SET_VOICE,
  data
})