import { addMediaFile } from './media.actions';
import { downloadFile } from '../../services/file';

export const downloadMediaFile = uri => dispatch => downloadFile(uri)
  .then(filePath => dispatch(addMediaFile(uri, filePath)));

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
