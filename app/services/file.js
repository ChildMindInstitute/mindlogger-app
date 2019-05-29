import * as R from 'ramda';
import RNFetchBlob from 'rn-fetch-blob';

const deleteFile = path => RNFetchBlob.fs.unlink(path.replace('file://', ''));

export const cleanFiles = (responses) => {
  responses.forEach((response) => {
    if (response && response.survey && response.survey.uri) {
      deleteFile(response.survey.uri);
    } else if (response && response.canvas && response.canvas.uri) {
      deleteFile(response.canvas.uri);
    } else if (response && response.uri) {
      deleteFile(response.uri);
    }
  });
};
