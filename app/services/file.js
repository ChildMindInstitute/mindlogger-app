import RNFetchBlob from 'rn-fetch-blob';

const stringHash = require('string-hash');

export const deleteFile = path => RNFetchBlob.fs.unlink(path.replace('file://', ''));

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

export const downloadFile = (uri) => {
  const fileName = stringHash(uri); // Not using this for cryptography

  // Get the extension - assumes filename has extension and discards any query params
  const extension = uri.split('.').pop().split('?').shift();

  const toPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}.${extension}`;

  return RNFetchBlob.fs.exists(toPath)
    .then((exist) => {
      // Don't download again if it's already there
      if (exist) {
        return toPath;
      }

      // If file doesn't exist, download it
      return RNFetchBlob
        .config({
          fileCache: true,
        })
        .fetch('GET', uri, { mode: 'cors' })
        .then((res) => {
          // Move the file from the temp folder to Documents
          const tempPath = res.path();
          return RNFetchBlob.fs.mv(tempPath, toPath);
        })
        .then(() => toPath);
    });
};
