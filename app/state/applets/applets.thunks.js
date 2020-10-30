import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
import {
  getApplets,
  registerOpenApplet,
  getAppletInvites,
  acceptAppletInvite,
  declineAppletInvite,
  removeApplet,
  deleteApplet,
  getLast7DaysData,
  postAppletBadge,
  getTargetApplet,
  getAppletSchedule,
} from '../../services/network';
import { scheduleNotifications } from '../../services/pushNotifications';
// eslint-disable-next-line
import { downloadResponses, downloadAppletResponses } from '../responses/responses.thunks';
import { downloadAppletsMedia, downloadAppletMedia } from '../media/media.thunks';
import { activitiesSelector } from './applets.selectors';
import {
  replaceTargetAppletSchedule,
  setNotifications,
  setDownloadingApplets,
  replaceApplets,
  setInvites,
  saveAppletResponseData,
  replaceTargetApplet,
  setDownloadingTargetApplet,
} from './applets.actions';
import { authSelector, userInfoSelector, loggedInSelector } from '../user/user.selectors';
import { setCurrentApplet } from '../app/app.actions';

import { sync } from '../app/app.thunks';
import { transformApplet } from '../../models/json-ld';

/* deprecated */
export const scheduleAndSetNotifications = () => (dispatch, getState) => {
  const state = getState();
  const activities = activitiesSelector(state);
  // This call schedules the notifications and returns a list of scheduled notifications
  const updatedNotifications = scheduleNotifications(activities);
  dispatch(setNotifications(updatedNotifications));
};

export const getInvitations = () => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  getAppletInvites(auth.token)
    .then((invites) => {
      dispatch(setInvites(invites));
    })
    .catch((e) => {
      console.warn(e);
    });
};

export const getSchedules = appletId => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);

  return getAppletSchedule(auth.token, appletId)
    .then((schedule) => {
      dispatch(replaceTargetAppletSchedule(appletId, schedule));
      return schedule;
    })
    .catch((e) => {
      console.warn(e);
    });
};

export const downloadApplets = (onAppletsDownloaded = null) => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  const userInfo = userInfoSelector(state);
  dispatch(setDownloadingApplets(true));
  getApplets(auth.token, userInfo._id)
    .then((applets) => {
      if (loggedInSelector(getState())) {
        // Check that we are still logged in when fetch finishes
        const transformedApplets = applets
          .filter(applet => !R.isEmpty(applet.items))
          .map(transformApplet);
        dispatch(replaceApplets(transformedApplets));
        dispatch(downloadResponses(transformedApplets));
        dispatch(downloadAppletsMedia(transformedApplets));
        if (onAppletsDownloaded) {
          onAppletsDownloaded();
        }
      }
    })
    .catch(err => console.warn(err.message))
    .finally(() => {
      dispatch(setDownloadingApplets(false));
      // dispatch(scheduleAndSetNotifications());
      // dispatch(getInvitations());
    });
};

export const downloadTargetApplet = (appletId, cb = null) => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  dispatch(setDownloadingTargetApplet(true));
  getTargetApplet(auth.token, appletId)
    .then((applet) => {
      if (loggedInSelector(getState())) {
        // Check that we are still logged in when fetch finishes
        const transformedApplets = [applet]
          .filter(applet => !R.isEmpty(applet.items))
          .map(transformApplet);
        if (transformedApplets && transformedApplets.length > 0) {
          const transformedApplet = transformedApplets[0];
          // eslint-disable-next-line no-console
          dispatch(replaceTargetApplet(transformedApplet));
          dispatch(downloadAppletResponses(transformedApplet));
          dispatch(downloadAppletMedia(transformedApplet));
        }
        dispatch(setDownloadingTargetApplet(false));
        if (cb) {
          cb();
        }
      }
    })
    .catch(err => console.warn(err.message));
};

export const acceptInvitation = inviteId => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  return acceptAppletInvite(auth.token, inviteId).then(() => {
    dispatch(getInvitations());
    dispatch(downloadApplets());
  });
};

export const declineInvitation = inviteId => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);

  return declineAppletInvite(auth.token, inviteId)
    .then(() => {
      dispatch(getInvitations());
      dispatch(downloadApplets());
    })
    .catch((e) => {
      console.log(e);
    });
};

export const joinOpenApplet = appletURI => (dispatch, getState) => {
  dispatch(setDownloadingApplets(true));
  const state = getState();
  const auth = authSelector(state);
  registerOpenApplet(auth.token, appletURI)
    .then(() => {
      dispatch(downloadApplets());
    })
    .catch((e) => {
      console.warn(e);
    });
};

export const updateBadgeNumber = badgeNumber => (dispatch, getState) => {
  const state = getState();
  const token = state.user?.auth?.token;
  if (token) {
    postAppletBadge(token, badgeNumber)
      .then((response) => {
        console.log('updateBadgeNumber success', response);
      })
      .catch((e) => {
        console.warn(e);
      });
  }
};

export const deactivateApplet = groupId => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  removeApplet(auth.token, groupId).then(() => {
    dispatch(setCurrentApplet(null));
    dispatch(sync());
    Actions.push('applet_list');
  });
};

export const removeAndDeleteApplet = groupId => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  deleteApplet(auth.token, groupId).then(() => {
    dispatch(setCurrentApplet(null));
    dispatch(sync());
    Actions.push('applet_list');
  });
};

export const getAppletResponseData = appletId => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  getLast7DaysData({
    authToken: auth.token,
    appletId,
  }).then((resp) => {
    // console.log('response is', resp);
    dispatch(saveAppletResponseData(appletId, resp));
  });
};
