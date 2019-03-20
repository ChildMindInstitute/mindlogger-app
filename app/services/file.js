import * as R from 'ramda';
import RNFetchBlob from 'react-native-fetch-blob';

const deleteFile = path => RNFetchBlob.fs.unlink(path.replace('file://', ''));

export const cleanFiles = (queuedUpload) => {
  const responses = R.pathOr([], ['payload', 'responses'], queuedUpload);
  responses.forEach((response) => {
    const { data } = response;
    if (data && data.survey && data.survey.uri) {
      deleteFile(data.survey.uri);
    } else if (data && data.canvas && data.canvas.uri) {
      deleteFile(data.canvas.uri);
    } else if (data && data.uri) {
      deleteFile(data.uri);
    }
  });
};
