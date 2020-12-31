import { Actions } from 'react-native-router-flux';
import * as firebase from 'react-native-firebase';
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
} from "../../services/network";
import { scheduleNotifications } from "../../services/pushNotifications";
// eslint-disable-next-line
import { downloadResponses, downloadAppletResponses } from '../responses/responses.thunks';
import { downloadAppletsMedia, downloadAppletMedia } from '../media/media.thunks';
import { activitiesSelector, allAppletsSelector } from './applets.selectors';
import {
  replaceTargetAppletSchedule,
  setNotifications,
  setDownloadingApplets,
  replaceApplets,
  setInvites,
  saveAppletResponseData,
  replaceTargetApplet,
  setDownloadingTargetApplet,
} from "./applets.actions";
import {
  authSelector,
  userInfoSelector,
  loggedInSelector,
} from "../user/user.selectors";
import { setCurrentApplet } from "../app/app.actions";

import { sync } from "../app/app.thunks";
import { transformApplet } from "../../models/json-ld";

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

export const getSchedules = (appletId) => (dispatch, getState) => {
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

export const setReminder = () => async (dispatch, getState) => {
  const state = getState();
  const applets = allAppletsSelector(state);
  const notifications = [];
  
  closeExistingNotifications();
  applets.forEach(applet => {
    const validEvents = [];
    Object.keys(applet.schedule.events).forEach(key => {
      const event = applet.schedule.events[key];

      Object.keys(applet.schedule.data).forEach(date => {
        const data = applet.schedule.data[date];
        const isValid = data.find(d => d.id === key && d.valid);
        if (isValid) {
          validEvents.push(event);
        }
      })
    });

    validEvents.forEach(event => {
      event.data.notifications.forEach(notification => {
        const values = notification.start.split(':');
        const date = new Date();

        date.setHours(values[0]);
        date.setMinutes(values[1]);
        if (date.getTime() > Date.now()) {
          notifications.push({
            eventId: event.id,
            appletId: applet.id.split('/').pop(),
            activityId: event.data.activity_id,
            activityName: event.data.title,
            date: date.getTime()
          });
        }
      })
    })
  });
  
  notifications.forEach(notification => {
    const settings = { showInForeground: true };
    const AndroidChannelId = 'MindLoggerChannelId';
    const localNotification = new firebase.notifications.Notification(settings)
      .setNotificationId(`${notification.activityId}-${Math.random()}`) // Any random ID
      .setTitle(notification.activityName) // Title of the notification
      .setData({
        event_id: notification.eventId,
        applet_id: notification.appletId,
        activity_id: notification.activityId,
        type: "event-alert"
      })
      .android.setPriority(firebase.notifications.Android.Priority.High) // set priority in Android
      .android.setChannelId(AndroidChannelId) // should be the same when creating channel for Android
      .android.setAutoCancel(true); // To remove notification when tapped on it

    firebase.notifications()
      .scheduleNotification(localNotification, {
        fireDate: notification.date,
        repeatInterval: 'day',
        exact: true,
      })
      .catch(err => console.error(err));
  })
};

const closeExistingNotifications = () => {
  firebase.notifications().cancelAllNotifications();
}

// const buildNotification = async (activity) => {
//   const title = Platform.OS === "android" ? "Daily Reminder" : "";
//   const AndroidChannelId = 'MindLoggerChannelId';
//   const notificationData = {
//     event_id: 1,
//     applet_id: activity.appletId.split('/').pop(),
//     activity_id: activity.id.split('/').pop(),
//     type: "event-alert"
//   }
//   const settings = { showInForeground: true };
//   const notification = new firebase.notifications.Notification(settings)
//     .setNotificationId(`${activity.id}-${Math.random()}`) // Any random ID
//     .setTitle(title) // Title of the notification
//     .setBody("This is a notification") // body of notification
//     .setData(notificationData);


//   notification.android.setPriority(firebase.notifications.Android.Priority.High) // set priority in Android
//   notification.android.setChannelId(AndroidChannelId) // should be the same when creating channel for Android
//   notification.android.setAutoCancel(true); // To remove notification when tapped on it

//   return notification;
// };

export const downloadApplets = (onAppletsDownloaded = null) => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  const userInfo = userInfoSelector(state);
  dispatch(setDownloadingApplets(true));
  getApplets(auth.token, userInfo._id)
    .then((applets) => {
      console.log(applets)
      if (loggedInSelector(getState())) {
        // Check that we are still logged in when fetch finishes
        const transformedApplets = applets
          .filter((applet) => !R.isEmpty(applet.items))
          .map(transformApplet);
        dispatch(replaceApplets(transformedApplets));
        dispatch(downloadResponses(transformedApplets));
        dispatch(downloadAppletsMedia(transformedApplets));
        if (onAppletsDownloaded) {
          onAppletsDownloaded();
        }
      }
    })
    .catch((err) => console.warn(err.message))
    .finally(() => {
      dispatch(setDownloadingApplets(false));
      // dispatch(scheduleAndSetNotifications());
      // dispatch(getInvitations());
    });
};

export const downloadTargetApplet = (appletId, cb = null) => (
  dispatch,
  getState
) => {
  const state = getState();
  const auth = authSelector(state);
  dispatch(setDownloadingTargetApplet(true));
  getTargetApplet(auth.token, appletId)
    .then((applet) => {
      if (loggedInSelector(getState())) {
        // Check that we are still logged in when fetch finishes
        const transformedApplets = [applet]
          .filter((applet) => !R.isEmpty(applet.items))
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
    .catch((err) => console.warn(err.message));
};

export const acceptInvitation = (inviteId) => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  return acceptAppletInvite(auth.token, inviteId).then(() => {
    dispatch(getInvitations());
    dispatch(downloadApplets());
  });
};

export const declineInvitation = (inviteId) => (dispatch, getState) => {
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

export const joinOpenApplet = (appletURI) => (dispatch, getState) => {
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

export const updateBadgeNumber = (badgeNumber) => (dispatch, getState) => {
  const state = getState();
  const token = state.user?.auth?.token;
  if (token) {
    postAppletBadge(token, badgeNumber)
      .then((response) => {
        console.log("updateBadgeNumber success", response);
      })
      .catch((e) => {
        console.warn(e);
      });
  }
};

export const deactivateApplet = (groupId) => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  removeApplet(auth.token, groupId).then(() => {
    dispatch(setCurrentApplet(null));
    dispatch(sync());
    Actions.push("applet_list");
  });
};

export const removeAndDeleteApplet = (groupId) => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  deleteApplet(auth.token, groupId).then(() => {
    dispatch(setCurrentApplet(null));
    dispatch(sync());
    Actions.push("applet_list");
  });
};

export const getAppletResponseData = (appletId) => (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  getLast7DaysData({
    authToken: auth.token,
    appletId,
  }).then((resp) => {
    console.log("response is", resp);
    dispatch(saveAppletResponseData(appletId, resp));
  });
};
