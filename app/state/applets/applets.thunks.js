import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
import { getApplets,
  registerOpenApplet,
  getAppletInvites,
  acceptAppletInvite,
  declineAppletInvite,
  removeApplet,
  deleteApplet,
  getLast7DaysData,
  getAppletSchedule,
} from '../../services/network';
import { scheduleNotifications } from '../../services/pushNotifications';
// eslint-disable-next-line
import { downloadResponses } from '../responses/responses.thunks';
import { downloadAppletsMedia } from '../media/media.thunks';
import { activitiesSelector } from './applets.selectors';
import { authSelector, userInfoSelector, loggedInSelector } from '../user/user.selectors';
import { setCurrentApplet } from '../app/app.actions';
import {
  setNotifications,
  setDownloadingApplets,
  replaceApplets,
  setInvites,
  saveAppletResponseData,
} from './applets.actions';
import { sync } from '../app/app.thunks';
import { transformApplet } from '../../models/json-ld';

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
  getAppletInvites(auth.token).then((invites) => {
    // console.log('setting applet invites', invites);
    dispatch(setInvites(invites));
  }).catch((e) => {
    console.warn(e);
  });
};


export const downloadApplets = () => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  const userInfo = userInfoSelector(state);
  dispatch(setDownloadingApplets(true));
  getApplets(auth.token, userInfo._id).then((applets) => {
    if (loggedInSelector(getState())) { // Check that we are still logged in when fetch finishes
      const transformedApplets = applets
        .filter(applet => !R.isEmpty(applet.items))
        .map(applet => transformApplet(applet));
      const requests = transformedApplets.map((applet) => {
        const appletId = applet.id.split('/')[1];
        return getAppletSchedule(auth.token, appletId).then((response) => {
          return {
            ...applet,
            schedule: response,
          };
        });
      });
      return Promise.all(requests)
        .then((updatedApplets) => {
          dispatch(replaceApplets(updatedApplets));
          dispatch(downloadResponses(updatedApplets));
          dispatch(downloadAppletsMedia(updatedApplets));
        });
    }
  }).catch((err) => {
    console.warn(err.message);
  }).finally(() => {
    dispatch(setDownloadingApplets(false));
    dispatch(scheduleAndSetNotifications());
    dispatch(getInvitations());
  });
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

  return declineAppletInvite(auth.token, inviteId).then(() => {
    dispatch(getInvitations());
    dispatch(downloadApplets());
  }).catch((e) => {
    console.log(e);
  });
};

export const joinOpenApplet = appletURI => (dispatch, getState) => {
  dispatch(setDownloadingApplets(true));
  const state = getState();
  const auth = authSelector(state);
  registerOpenApplet(
    auth.token,
    appletURI,
  )
    .then(() => {
      dispatch(downloadApplets());
    })
    .catch((e) => {
      console.warn(e);
    });
};

export const deactivateApplet = groupId => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  removeApplet(auth.token, groupId)
    .then(() => {
      dispatch(setCurrentApplet(null));
      dispatch(sync());
      Actions.push('applet_list');
    });
};

export const removeAndDeleteApplet = groupId => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  deleteApplet(auth.token, groupId)
    .then(() => {
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
