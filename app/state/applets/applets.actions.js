import { downloadAllApplets } from '../../services/network';
import APPLET_CONSTANTS from './applets.contants';

export const replaceApplets = applets => ({
  type: APPLET_CONSTANTS.REPLACE_APPLETS,
  payload: applets,
});

export const setDownloadingApplets = isDownloading => ({
  type: APPLET_CONSTANTS.SET_DOWNLOADING_APPLETS,
  payload: isDownloading,
});

export const setAppletDownloadProgress = (downloaded, total) => ({
  type: APPLET_CONSTANTS.SET_APPLET_DOWNLOAD_PROGRESS,
  payload: {
    downloaded,
    total,
  },
});

export const downloadApplets = () => (dispatch, getState) => {
  const { core } = getState();
  const { auth, self } = core;
  dispatch(setDownloadingApplets(true));
  downloadAllApplets(auth.token, self._id, (downloaded, total) => {
    dispatch(setAppletDownloadProgress(downloaded, total));
  }).then((applets) => {
    dispatch(replaceApplets(applets));
  }).finally(() => {
    dispatch(setDownloadingApplets(false));
  });
};
