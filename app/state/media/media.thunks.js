import { addMediaFile, clearMedia } from './media.actions';
import { downloadFile, deleteFile } from '../../services/file';
import { loggedInSelector } from '../user/user.selectors';

export const downloadMediaFile = uri => (dispatch, getState) => downloadFile(uri)
  .then((filePath) => {
    // Make sure user is still logged in when the download finishes
    const state = getState();
    const loggedIn = loggedInSelector(state);
    if (loggedIn) {
      dispatch(addMediaFile(uri, filePath));
    } else {
      deleteFile(filePath);
    }
  });

export const downloadAppletsMedia = transformedApplets => (dispatch) => {
  transformedApplets.forEach((applet) => {
    applet.activities.forEach((activity) => {
      activity.items.forEach((item) => {
        if (item.media) {
          item.media.forEach((media) => {
            if (typeof media.contentUrl === 'string') {
              dispatch(downloadMediaFile(media.contentUrl));
            }
          });
        }
      });
    });
  });
};

export const deleteAndClearMedia = () => (dispatch, getState) => {
  const { media } = getState();
  const { mediaMap } = media;
  Object.keys(mediaMap).forEach((key) => {
    deleteFile(mediaMap[key]);
  });
  dispatch(clearMedia());
};
