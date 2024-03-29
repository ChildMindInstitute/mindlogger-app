import { Platform } from 'react-native'
import { Actions } from 'react-native-router-flux';
import * as firebase from 'react-native-firebase';
import * as R from 'ramda';
import _ from 'lodash';
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
// eslint-disable-next-line
import { downloadAppletResponses, updateKeys } from '../responses/responses.thunks';
import { inProgressSelector, responsesSelector } from '../responses/responses.selectors';
import { prepareResponseKeys, addScheduleNotificationsReminder, clearScheduleNotificationsReminder } from "./applets.actions";

import { debugScheduledNotifications } from '../../utils/debug-utils'

import { downloadAppletsMedia, downloadAppletMedia } from '../media/media.thunks';
import { activitiesSelector, allAppletsSelector, appletsSelector } from './applets.selectors';
import {
  replaceTargetAppletSchedule,
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
import { getNotificationArray } from '../../features/notifications/factories/NotificationsBuilder';
import { NotificationManager, NotificationBuilder } from '../../features/notifications';
import { NotificationManagerMutex } from '../../features/notifications/services/NotificationManager';
import { canSupportNotifications } from '../../utils/constants'

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

export const setLocalNotifications = (trigger) => async (
  dispatch,
  getState
) => {
  if (!canSupportNotifications) return;

  try {
    await setLocalNotificationsInternal(dispatch, getState, trigger);
  } catch (error) {
    console.warn("Error in scheduling local notifications", error);
  }
};

const setLocalNotificationsInternal = async (dispatch, getState, trigger) => {
  const state = getState();

  const applets = appletsSelector(state);

  const { finishedTimes } = state.app;

  const appletsNotifications = {
    applets: [],
  };

  applets.forEach((applet) => {
    const appletNotifications = NotificationBuilder.build(
      applet,
      finishedTimes
    );
    if (appletNotifications.events.some((x) => x.notifications.length)) {
      appletsNotifications.applets.push(appletNotifications);
    }
  });

  const notificationArray = getNotificationArray(appletsNotifications);

  if (NotificationManagerMutex.isBusy()) {
    console.warn(
      "[setLocalNotificationsInternal]: NotificationManagerMutex is busy. Operation rejected"
    );
    return;
  }

  try {
    NotificationManagerMutex.setBusy();

    await NotificationManager.scheduleNotifications(notificationArray);

    await debugScheduledNotifications({
      notificationDescriptions: appletsNotifications,
      actionType: `totalReschedule_${trigger}`,
    });
  } finally {
    NotificationManagerMutex.release();
  }
};

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

    if (eventsExistInDto) {
      const dtoEventIds = Object.keys(appletInfoDto.schedule.events);

      dtoEventIds.forEach(dtoEventId => {
        currentEvents[dtoEventId] = appletInfoDto.schedule.events[dtoEventId];
        scheduleUpdated = true;
      })
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

export const downloadApplets = (onAppletsDownloaded = null, keys = null, trigger = null) => async (dispatch, getState) => {
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

        dispatch(setLocalNotifications(`getApplets.then${!trigger ? "" : "-" + trigger}`));
      }
    })
    .catch((err) => console.warn(err.message))
    .finally(() => {
      dispatch(setDownloadingApplets(false));
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
        dispatch(setLocalNotifications("getTargetApplet.then"));
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
