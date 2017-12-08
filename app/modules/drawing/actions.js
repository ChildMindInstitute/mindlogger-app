import * as types from './actionTypes';

export const loadDrawings = (data) => ({
  type: types.LOAD_DRAWINGS,
  data
})

export const addDrawing = (data) => ({
  type: types.ADD_DRAWING,
  data
})

export const updateDrawing = (index, data) => ({
  type: types.UPDATE_DRAWING,
  index: index,
  data                                  
})

export const deleteDrawing = (index) => ({
  type: types.DELETE_DRAWING,
  index
})

export const setDrawing = (data) => ({
  type: types.SET_DRAWING,
  data
})