import moment from 'moment'
import { Actions } from "react-native-router-flux";

import { SCENES_TO_NOT_RENDER_NOTIFICATIONS } from './constants';

export function mapToTriggerNotifications(notifications = []) {
    return notifications.map(notification => ({
        notification: {
            title: notification.notificationHeader,
            body: notification.notificationBody,
            notificationId: notification.notificationId,
            data: {
                shortId: notification.shortId,
                scheduledAt: notification.scheduledAt,
                scheduledAtString: notification.scheduledAtString,
                appletId: notification.appletId,
                activityId: notification.activityId,
                activityFlowId: notification.activityFlowId,
                eventId: notification.eventId,
                isLocal: true,
                type: "schedule-event-alert",
            }
        },
        trigger: {
            fireDate: notification.scheduledAt,
        }
    }))
}

export function filterNotificationsByDate(notifications = [], date) {
    if (!date) throw Error('[filterNotificationsByDate] date is required');

    return notifications.filter(notification => {
        return notification.scheduledAt > date;
    })
}

export function splitArray(array, leftArraySize) {
    if (!leftArraySize) throw Error('[splitArray] leftArraySize is required');
    if (typeof leftArraySize !== 'number') throw Error('[splitArray] leftArraySize must be number');

    const rightArray = [...array];

    const leftArray = rightArray.splice(0, leftArraySize);

    return [leftArray, rightArray];
}

export const getMutex = () => {
  const mutex = {
    busy: false,
    setBusy: function() {
      this.busy = true;
    },
    release: function() {
      this.busy = false;
    },
    isBusy: function() {
      return this.busy;
    },
  };
  return mutex;
};

export const getActivityPrefixedId = (uid) => "activity/" + uid;
export const getActivityFlowPrefixedId = (uid) => "activity_flow/" + uid;

export const getActivityResponseDateTime = ({
  activityId,
  activityFlowId,
  eventId,
  finishedTimes
}) => {
  let fullId;

  if (activityId) {
    fullId = getActivityPrefixedId(activityId + eventId);
  }

  if (activityFlowId) {
    fullId = getActivityFlowPrefixedId(activityFlowId + eventId);
  }

  const responseDateTime = finishedTimes[fullId];

  return responseDateTime ? moment(Number(responseDateTime)) : null;
};

export const getIdBySplit = (sid) => sid.split("/").pop();

export function isActivityCompletedToday({ activityId, activityFlowId, eventId, getFinishedTimes }) {
  const responseDateTime = getActivityResponseDateTime({
    activityId,
    activityFlowId,
    eventId,
    finishedTimes: getFinishedTimes(),
  });

  if (!responseDateTime) return false;

  const responseStartOfDay = responseDateTime.startOf('day');
  const startOfCurrentDay = moment().startOf('day');

  return responseStartOfDay.isSame(startOfCurrentDay);
}

export function canShowNotificationOnCurrentScreen() {
  return !SCENES_TO_NOT_RENDER_NOTIFICATIONS.includes(Actions.currentScene);
}
