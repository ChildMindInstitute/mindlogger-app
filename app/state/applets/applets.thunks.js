import { Actions } from 'react-native-router-flux';
import * as firebase from 'react-native-firebase';
import * as R from 'ramda';
import _ from 'lodash';
import moment from "moment";
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
import { getData, storeData } from "../../services/storage";
import { scheduleNotifications } from "../../services/pushNotifications";
// eslint-disable-next-line
import { downloadAppletResponses, updateKeys } from '../responses/responses.thunks';
import { inProgressSelector, responsesSelector } from '../responses/responses.selectors';
import { prepareResponseKeys, addScheduleNotificationsReminder, clearScheduleNotificationsReminder } from "./applets.actions";

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
  setScheduleUpdated,
  setUserProfiles
} from "./applets.actions";
import {
  authSelector,
  userInfoSelector,
  loggedInSelector,
} from "../user/user.selectors";
import { setCurrentApplet, setClosedEvents } from "../app/app.actions";
import { replaceResponses, setLastResponseTime } from "../responses/responses.actions";
import { setActivityFlowOrderIndexList } from "../activities/activities.actions";

import { sync } from "../app/app.thunks";
import { transformApplet } from "../../models/json-ld";
import { decryptAppletResponses, mergeResponses } from "../../models/response";
import config from "../../config";
import { buildScheduleNotifications, getNotificationArray } from '../../services/scheduleNotifications';
import { NotificationManager, NotificationQueue, NotificationScheduler } from '../../features/notifications';


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

export const setLocalNotifications = () => async (dispatch, getState) => {
  try {
    await setLocalNotificationsInternal(dispatch, getState)
  } catch (error) {
    console.warn('Error in scheduling local notifications', error);
  }  
}

const setLocalNotificationsInternal = async (dispatch, getState) => {
  firebase.notifications().cancelAllNotifications();

  const state = getState();

  const applets = allAppletsSelector(state);

  const { finishedTimes } = state.app;

  const appletsNotifications = {
    applets: []
  };

  applets.forEach((applet) => {
    const appletNotifications = buildScheduleNotifications(applet, finishedTimes);
    if(appletNotifications.events.some(x => x.notifications.length)) {
      appletsNotifications.applets.push(appletNotifications);
    }
  });

  console.log('appletsNotifications:', appletsNotifications);

  const notificationArray = getNotificationArray(appletsNotifications);

  console.log('notificationArray', notificationArray);

  await NotificationManager.scheduleNotifications(notificationArray);

  //NotificationQueue
  //NotificationScheduler
}

export const scheduleNotificationsRN = (notification, ms) => {
  return setTimeout(() => {
    firebase.notifications().displayNotification(notification)
  }, ms);
}

const buildLocalInfo = (currentApplets, oldResponses) => {
  let localInfo = {};

  if (currentApplets) {
    currentApplets.forEach(applet => {
      const { contentUpdateTime, id } = applet;
      const response = oldResponses ? oldResponses.find(r => id === r.appletId) : null;
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
        localItems: response && response.items ? Object.keys(response.items) : [],
        localActivities: response && response.activities ? Object.keys(response.activities) : [],
        localEvents,
        startDate: response ? response['schema:endDate'] : null,
        localResponses: response && response.dataSources ? Object.keys(response.dataSources) : [],
      }
    })
  } else {
    localInfo = {};
  }
  return localInfo;
}

const mergeExistingApplet = (currentApplets, appletInfoDto, responses) => {
  const currentApplet = currentApplets.find(({ id }) => id.split("/").pop() === appletInfoDto.id);
  let scheduleUpdated = false;

  if (appletInfoDto.schedule) {
    
    const currentEvents = currentApplet.schedule.events;
    
    currentApplet.schedule = appletInfoDto.schedule;

    const updatedCurrentSchedule =  currentApplet.schedule;

    const eventsExistInDto = !R.isEmpty(appletInfoDto.schedule.events);

    let notificationEventsTemp = null;

    if (eventsExistInDto) {
      const dtoEventIds = Object.keys(appletInfoDto.schedule.events);

      dtoEventIds.forEach(dtoEventId => {
        currentEvents[dtoEventId] = appletInfoDto.schedule.events[dtoEventId];
        scheduleUpdated = true;
      })

      notificationEventsTemp = { ...appletInfoDto.schedule.events };
    } else {
      notificationEventsTemp = { ...currentEvents };
    }

    for (const eventId in currentEvents) {
      let isEventInDates = false;

      const dataDto = updatedCurrentSchedule.data;

      for (const eventDate in dataDto) {
        const eventsInDate = dataDto[eventDate];

        if (eventsInDate.find(({ id }) => id === eventId)) {
          isEventInDates = true;
        }
      }

      if (!isEventInDates) {
        delete currentEvents[eventId];
      }
    }

    updatedCurrentSchedule.events = currentEvents;
    updatedCurrentSchedule.notificationEventsTemp = notificationEventsTemp;
  }

  responses.push({
    ...decryptAppletResponses(currentApplet, appletInfoDto.responses),
    appletId: 'applet/' + appletInfoDto.id
  });

  if (!currentApplet.activityFlows) {
    currentApplet.activityFlows = [];
  }

  return { currentApplet, scheduleUpdated };
}

export const downloadApplets = (onAppletsDownloaded = null, keys = null) => async (dispatch, getState) => {
  const state = getState();
  const auth = authSelector(state);
  const allApplets = allAppletsSelector(state), allResponses = responsesSelector(state);
  let currentApplets = allApplets && allApplets.length ? allApplets : await getData('ml_applets');
  let oldResponses = allResponses && allResponses.length ? allResponses : await getData('ml_responses');

  let localInfo = buildLocalInfo(currentApplets, oldResponses);

  dispatch(setDownloadingApplets(true)); 

  return getApplets(auth.token, localInfo)
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
        let finishedEvents = {};
        let lastResponseTime = {}, profiles = {}, lastActivities = {};

        const transformedApplets = applets
          .map((appletInfo) => {
            Object.assign(finishedEvents, appletInfo.finishedEvents);

            lastResponseTime[`applet/${appletInfo.id}`] = appletInfo.lastResponses;
            profiles[`applet/${appletInfo.id}`] = appletInfo.profile;

            for (let flowId in appletInfo.lastActivities) {
              const activityId = appletInfo.lastActivities[flowId];
              lastActivities[flowId] = activityId;
            }

            if (!appletInfo.applet) {

              const mergeResult = mergeExistingApplet(currentApplets, appletInfo, responses);
              scheduleUpdated = scheduleUpdated || mergeResult.scheduleUpdated;
              
              return mergeResult.currentApplet;

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

        for (let i = 0; i < transformedApplets.length; i++) {
          const applet = transformedApplets[i];

          for (const flow of applet.activityFlows) {
            const activityId = lastActivities[flow.id];
            const activity = applet.activities.find(activity => activity.id.split('/').pop() === activityId)

            if (activity) {
              lastActivities[flow.id] = (flow.order.indexOf(activity.name.en) + 1) % flow.order.length;
            } else {
              lastActivities[flow.id] = 0;
            }
          }
        }

        dispatch(setActivityFlowOrderIndexList(lastActivities));

        for (let i = 0; i < responses.length; i++) {
          const old = oldResponses && oldResponses.find(old => old && old.appletId == responses[i].appletId);

          if (old) {
            mergeResponses(old, responses[i]);
          }
        }

        dispatch(setUserProfiles(profiles));
        dispatch(setLastResponseTime(lastResponseTime));
        dispatch(setClosedEvents(finishedEvents));

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

        dispatch(setLocalNotifications());
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
        dispatch(setLocalNotifications());
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
