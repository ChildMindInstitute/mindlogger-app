
import { Platform } from 'react-native';
import {saveUserLocal} from './coreActions'
import * as types from './actionTypes'
import { btoa } from '../helper';

function generateQuery(params) {
  var esc = encodeURIComponent;
  let result = []
  Object.keys(params)
    .forEach(k => {
      if(params[k]) 
        result.push(esc(k) + '=' + esc(params[k]))
    })
  return result.join('&')
}

export const signUp = (body) => ({
  type: types.SIGN_UP,
  method: 'POST',
  path: '/user',
  body,
});

export const changePassword = (id, body) => ({
  type: types.CHANGE_PASSWORD,
  method: 'PUT',
  path: `/user/${id}/password`,
  body,
});

export const signIn = ({user, password}) => ({
  type: types.SIGN_IN,
  method: 'GET',
  path: '/user/authentication',
  extraHeaders: { 'Girder-Authorization': `Basic ${btoa(user + ":" + password)}` }
});

export const signOut = () => ({
    type: types.SIGN_OUT,
})

export const updateUser = (id, body) => ({
  type: types.UPDATE_USER,
  method: 'PUT',
  path: `/user/${id}`,
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

export const listObjects = (parentId, parentType, name, objectType) => ({
  type: types.LIST_OBJECTS,
  method: 'GET',
  objectType,
  name,
  parentId,
  parentType,
  path: `/${objectType}?${generateQuery({parentId, parentType})}`,
});

export const getObject = (type, id) => ({
  type: types.GET_OBJECT,
  method: 'GET',
  path: `/${type}/${id}`,
});

export const fetchObject = (objectPath) => ({
  type: types.FETCH_OBJECT,
  method: 'GET',
  objectPath,
  path: `/${objectPath}`,
});

export const addObject = (type, name, meta, options) => ({
  type: types.ADD_OBJECT,
  method: 'POST',
  path: `/${type}`,
  objectType: type,
  body: {
    name,
    metadata:JSON.stringify(meta),
    ...options,
  },
});

export const updateObject = (type, id, name, meta, options={}) => ({
  type: types.UPDATE_OBJECT,
  method: 'PUT',
  objectType: type,
  path: `/${type}/${id}`,
  body: {
    name,
    metadata:JSON.stringify(meta),
    ...options
  },
});

export const addItem = (name, meta, folderId) => (addObject('item', name, meta, {folderId}));
export const updateItem = (id, name, meta) => (updateObject('item', id, name, meta));

// Volumes
export const getCollection = (name) => ({
  type: types.GET_COLLECTION,
  method: 'GET',
  name,
  path: `/collection?text=${name}`,
});

export const getFolders = (parentId, name, parentType='collection') => ({
  type: types.LIST_OBJECTS,
  method: 'GET',
  objectType: 'folder',
  name,
  parentId, parentType,
  path: `/folder?${generateQuery({parentId, parentType})}`,
});

export const addFolder = (name, meta, parentId, parentType, reuseExisting = true) => ({
  type: types.ADD_OBJECT,
  method: 'POST',
  path: '/folder',
  objectType: 'folder',
  body: {
    name,
    metadata:JSON.stringify(meta),
    parentId,
    parentType,
    reuseExisting,
  },
});

export const updateFolder = (id, name, meta) => ({
  type: types.UPDATE_OBJECT,
  method: 'PUT',
  objectType: 'folder',
  path: `/folder/${id}`,
  body: {
    name,
    metadata:JSON.stringify(meta),
  },
});

export const uploadFile = (name, fileObject, parentType, parentId) => ({
  type: types.ADD_OBJECT,
  method: 'POST',
  path: `/file?${generateQuery({
    parentId,
    parentType,
    name,
    size:fileObject.size,
    mimeType: fileObject.type,
  })}`,
  body: fileObject,
})

export const getItems = (parentId) => ({
  type: types.LIST_OBJECTS,
  method: 'GET',
  objectType: 'item',
  parentId,
  parentType: 'folder',
  path: `/item?${generateQuery({folderId:parentId})}`,
});
