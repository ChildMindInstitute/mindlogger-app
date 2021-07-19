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
import { getData, storeData } from "../../services/asyncStorage";
import { scheduleNotifications } from "../../services/pushNotifications";
// eslint-disable-next-line
import { downloadAppletResponses, updateKeys } from '../responses/responses.thunks';
import { prepareResponseKeys } from "../applets/applets.actions";

import { downloadAppletsMedia, downloadAppletMedia } from '../media/media.thunks';
import { activitiesSelector, allAppletsSelector } from './applets.selectors';
import {
  replaceTargetAppletSchedule,
  setNotifications,
  setDownloadingApplets,
  replaceApplets,
  setInvites,
  setNotificationReminder,
  clearNotificationReminder,
  saveAppletResponseData,
  replaceTargetApplet,
  setDownloadingTargetApplet,
  setScheduleUpdated
} from "./applets.actions";
import {
  authSelector,
  userInfoSelector,
  loggedInSelector,
} from "../user/user.selectors";
import { isReminderSetSelector } from "./applets.selectors";
import { setCurrentApplet } from "../app/app.actions";
import { replaceResponses } from "../responses/responses.actions";

import { sync } from "../app/app.thunks";
import { transformApplet } from "../../models/json-ld";
import { decryptAppletResponses } from "../../models/response";
import config from "../../config";

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
  const isReminderSet = isReminderSetSelector(state);
  const notifications = [];

  cancelReminder();
  applets.forEach(applet => {
    const validEvents = [];
    Object.keys(applet.schedule.events).forEach(key => {
      const event = applet.schedule.events[key];

      Object.keys(applet.schedule.data).forEach(date => {
        const data = applet.schedule.data[date];
        const isValid = data.find(d => d.id === key && d.valid);
        if (isValid) {
          const validEvent = {
            ...event,
            date,
          }
          validEvents.push(validEvent);
        }
      })
    });

    validEvents.forEach(event => {
      event.data.notifications.forEach(notification => {
        if (notification.start) {
          const values = notification.start.split(':');
          const date = new Date(event.date);

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
        }
      })
    })
  });

  if (!isReminderSet) {
    if (notifications.length) {
      dispatch(setNotificationReminder());
    }

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
  }
};

export const cancelReminder = () => (dispatch, getState) => {
  const state = getState();
  const isReminderSet = isReminderSetSelector(state);

  if (isReminderSet) {
    firebase.notifications().cancelAllNotifications();
    dispatch(clearNotificationReminder());
  }
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

export const downloadApplets = (onAppletsDownloaded = null, keys = null) => async (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  const currentApplets = await getData('ml_applets');
  const currentResponses = await getData('ml_responses');
  let localInfo = {};

  if (currentApplets) {
    currentApplets.forEach(applet => {
      const { contentUpdateTime, id } = applet;
      const response = currentResponses ? currentResponses.find(r => id === r.appletId) : null;
      const localEvents = Object.keys(applet.schedule.events).map(id => {
        event = applet.schedule.events[id];
        return {
          id,
          updated: event.updated,
        };
      });

      localInfo[id.split("/").pop()] = {
        appletVersion: applet.schemaVersion.en,
        contentUpdateTime,
        localItems: response ? Object.keys(response.items) : [],
        localActivities: response ? Object.keys(response.activities) : [],
        localEvents,
        startDate: response ? response['schema:startDate'] : null,
      }
    })
  } else {
    localInfo = {};
  }

  dispatch(setDownloadingApplets(true));
  getApplets(auth.token, localInfo)
    .then(async (resp) => {
      let applets = [];
      if (resp.data)
        applets = resp.data;
      else
        applets = resp;

      if (loggedInSelector(getState())) {
        // Check that we are still logged in when fetch finishes
        const userInfo = userInfoSelector(state);
        const responses = [];
        let scheduleUpdated = false;

        const transformedApplets = applets
          .map((appletInfo) => {
            if (!appletInfo.applet) {
              const currentApplet = currentApplets.find(({ id }) => id.split("/").pop() === appletInfo.id)
              if (appletInfo.schedule) {
                const events = currentApplet.schedule.events;
                currentApplet.schedule = appletInfo.schedule;

                if (!R.isEmpty(appletInfo.schedule.events)) {
                  Object.keys(appletInfo.schedule.events).forEach(eventId => {
                    events[eventId] = appletInfo.schedule.events[eventId];
                    scheduleUpdated = true;
                  })
                }

                for (const eventId in events) {
                  let isValid = false;
                  for (const eventDate in currentApplet.schedule.data) {
                    if (currentApplet.schedule.data[eventDate].find(({ id }) => id === eventId)) {
                      isValid = true;
                    }
                  }

                  if (!isValid) {
                    delete events[eventId];
                  }
                }
                currentApplet.schedule.events = events;
              }
              responses.push(currentResponses.find(({ appletId }) => appletId.split("/").pop() === appletInfo.id));
              return currentApplet;
          } else {
            const applet = transformApplet(appletInfo, currentApplets);
            if ((!applet.AESKey || !applet.userPublicKey) && config.encryptResponse) {
              const appletId = applet.id.split('/')[1];

              if (keys && keys[appletId]) {
                dispatch(prepareResponseKeys(applet.id, keys[appletId]))
                Object.assign(applet, keys[appletId]);
              } else {
                dispatch(updateKeys(applet, userInfo));
              }
            }
            responses.push({
              ...decryptAppletResponses(applet, appletInfo.responses),
              appletId: 'applet/' + appletInfo.id
            });

            return applet;
          }
        });

  await storeData('ml_applets', transformedApplets);
  await storeData('ml_responses', responses);

  if (scheduleUpdated) {
    dispatch(setScheduleUpdated(true));
  }
  dispatch(replaceApplets(transformedApplets));
  dispatch(replaceResponses(responses));
  // dispatch(downloadAppletsMedia(transformedApplets));
  if (onAppletsDownloaded) {
    onAppletsDownloaded();
  }
}
    })
    .catch ((err) => console.warn(err.message))
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
      .then((response) => { })
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
    dispatch(saveAppletResponseData(appletId, resp));
  });
};
