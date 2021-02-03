import Permissions, {
  check,
  checkMultiple,
  requestMultiple,
  request,
  PERMISSIONS,
} from 'react-native-permissions';
import { Platform, Linking, Alert } from 'react-native';

const isIos = Platform.OS === 'ios';

// const denied = Permissions.RESULTS.DENIED;
const granted = Permissions.RESULTS.GRANTED;
// const blocked = Permissions.RESULTS.BLOCKED;
const unavailable = Permissions.RESULTS.UNAVAILABLE;

function _showDialog(title) {
  Alert.alert(
    title,
    'These can be configured in Settings.',
    [
      {
        text: 'Dismiss',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ],
  );
}

const checkGalleryPermission = (): Promise => {
  return new Promise((resolve) => {
    if (isIos) {
      resolve();
    } else {
      // Android, ask READ & WRITE external
      checkMultiple([
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ])
        .then((statuses) => {
          if (
            statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === granted
            && statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === granted
          ) {
            resolve();
          } else {
            requestMultiple([
              PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
              PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
            ])
              .then((requestedStatuses) => {
                if (
                  requestedStatuses[
                    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
                  ] === granted
                  && requestedStatuses[
                    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
                  ] === granted
                ) {
                  resolve();
                } else {
                  _showDialog(
                    '"MindLogger" would like to use your gallery to complete this task.',
                  );
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
  });
};

const checkCameraPermission = (): Promise => {
  return new Promise((resolve) => {
    if (isIos) {
      check(PERMISSIONS.IOS.CAMERA)
        .then((status) => {
          if (status === granted || status === unavailable) {
            resolve();
          } else {
            request(PERMISSIONS.IOS.CAMERA)
              .then((requestedStatuses) => {
                if (
                  requestedStatuses === granted
                  || requestedStatuses === unavailable
                ) {
                  resolve();
                } else {
                  _showDialog(
                    '"MindLogger" would like to use your camera to complete this task.',
                  );
                }
              })
              .catch(() => {
              });
          }
        })
        .catch(() => {
        });
    } else {
      check(PERMISSIONS.ANDROID.CAMERA)
        .then((status) => {
          if (status === granted || status === unavailable) {
            resolve();
          } else {
            request(PERMISSIONS.ANDROID.CAMERA)
              .then((requestedStatuses) => {
                if (
                  requestedStatuses === granted
                  || requestedStatuses === unavailable
                ) {
                  resolve();
                } else {
                  _showDialog(
                    '"MindLogger" would like to use your camera to complete this task.',
                  );
                }
              })
              .catch(() => {
              });
          }
        })
        .catch(() => {
        });
    }
  });
};

const permissions = {
  checkGalleryPermission,
  checkCameraPermission,
};

export default permissions;
