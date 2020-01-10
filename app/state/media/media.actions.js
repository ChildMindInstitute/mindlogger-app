import MEDIA_CONSTANTS from './media.constants';

export const addMediaFile = (uri, filePath) => ({
  type: MEDIA_CONSTANTS.ADD_MEDIA_FILE,
  payload: {
    uri,
    filePath,
  },
});

export const removeMediaFile = uri => ({
  type: MEDIA_CONSTANTS.REMOVE_MEDIA_FILE,
  payload: uri,
});

export const clearMedia = () => ({
  type: MEDIA_CONSTANTS.CLEAR_MEDIA_FILES,
});
