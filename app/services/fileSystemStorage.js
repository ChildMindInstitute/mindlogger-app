import RNFetchBlob from "rn-fetch-blob";

const createStoragePathIfNeeded = path =>
  RNFetchBlob.fs
    .exists(path)
    .then(exists =>
      exists
        ? new Promise(resolve => resolve(true))
        : RNFetchBlob.fs.mkdir(path)
    );

const onStorageReadyFactory = (storagePath) => (func) => {
  const storage = createStoragePathIfNeeded(storagePath);

  return (...args) => storage.then(() => func(...args));
};

const defaultStoragePath = `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`;

let onStorageReady = onStorageReadyFactory(defaultStoragePath);
let options = {
  storagePath: defaultStoragePath,
  encoding: "utf8",
  toFileName: (name) => name.split(":").join("-"),
  fromFileName: (name) => name.split("-").join(":")
};

const pathForKey = (key) =>
  `${options.storagePath}/${options.toFileName(key)}`;

const FilesystemStorage = {
  setItem: (key, value, callback = null) =>
    RNFetchBlob.fs
      .writeFile(pathForKey(key), value, options.encoding)
      .then(() => callback && callback())
      .catch(error => callback && callback(error)),

  getItem: onStorageReady(
    (key, callback = null) => {
      const filePath = pathForKey(options.toFileName(key));

      return RNFetchBlob.fs
        .readFile(filePath, options.encoding)
        .then(data => {
          if (!callback) {
            return data;
          }
          callback(null, data);
        })
        .catch(err => {
          return RNFetchBlob.fs
            .exists(filePath)
            .then(exists => {
              if (!exists) {
                return null;
              } else {
                if (!callback) {
                  throw err;
                }
                callback(err);
              }
            })
        });
    }
  ),

  removeItem: (key, callback = null) => {
    const filePath = pathForKey(options.toFileName(key));

    const handleError = err => {
      if (!callback) {
        throw err;
      }
      callback(err);
    }

    return RNFetchBlob.fs
      .exists(filePath)
      .then(exists => {
        if (!exists) {
          return null;
        } else {
          return RNFetchBlob.fs
            .unlink(filePath)
            .then(() => callback && callback())
            .catch(handleError);
        }
      })
      .catch(handleError);
  },

  getAllKeys: (callback = null) =>
    RNFetchBlob.fs
      .exists(options.storagePath)
      .then(exists =>
        exists ? true : RNFetchBlob.fs.mkdir(options.storagePath)
      )
      .then(() =>
        RNFetchBlob.fs
          .ls(options.storagePath)
          .then(files => files.map(file => options.fromFileName(file)))
          .then(files => {
            callback && callback(null, files);
            if (!callback) {
              return files;
            }
          })
      )
      .catch(error => {
        callback && callback(error);
        if (!callback) {
          throw error;
        }
      }),

  clear: undefined // Workaround for Flow error coming from `clear` not being part of object literal
};

FilesystemStorage.clear = (callback = null) =>
  FilesystemStorage.getAllKeys((error, keys) => {
    if (error) throw error;

    if (Array.isArray(keys) && keys.length) {
      const removedKeys = [];

      keys.forEach(key => {
        FilesystemStorage.removeItem(key, (error = null) => {
          removedKeys.push(key);
          if (error && callback) {
            callback(error, false);
          }

          if (removedKeys.length === keys.length && callback)
            callback(null, true);
        });
      });
      return true;
    }

    callback && callback(null, false);
    return false;
  }).catch(error => {
    callback && callback(error);
    if (!callback) {
      throw error;
    }
  });

export default FilesystemStorage;
