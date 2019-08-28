import Actions from 'react-native-router-flux';
import { getApplets,
  registerOpenApplet,
  getAppletInvites,
  acceptAppletInvite,
  declineAppletInvite,
  removeApplet,
  deleteApplet,
 } from '../../services/network';
import { scheduleNotifications } from '../../services/pushNotifications';
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
} from './applets.actions';
import { transformApplet } from '../../models/json-ld';

export const scheduleAndSetNotifications = () => (dispatch, getState) => {
  const state = getState();
  const activities = activitiesSelector(state);
  // This call schedules the notifications and returns a list of scheduled notifications
  const updatedNotifications = scheduleNotifications(activities);
  console.log('dispatching set notifications', activities, updatedNotifications);
  dispatch(setNotifications(updatedNotifications));
};

export const getInvitations = () => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  getAppletInvites(auth.token).then((invites) => {
    console.log('setting applet invites', invites);
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
      const transformedApplets = applets.map(applet => transformApplet(applet));
      dispatch(replaceApplets(transformedApplets));
      dispatch(downloadResponses(transformedApplets));
      dispatch(downloadAppletsMedia(transformedApplets));
    }
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
  removeApplet(auth.token, groupId); // .then((resp) => {
  //
  // dispatch(setCurrentApplet(null));
  // Actions.push('applet_list');
  // });
};

export const removeAndDeleteApplet = groupId => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  deleteApplet(auth.token, groupId); // .then((resp) => {
  // dispatch(setCurrentApplet(null));
  // Actions.push('applet_list');
  // });
};
