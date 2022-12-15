import { getData, storeData } from '../../../services/storage'

import { MAX_SCHEDULED_NOTIFICATIONS_SIZE, isAndroid, SYSTEM_RESCHEDULING_NOTIFICATION_ID, SYSTEM_NOTIFICATION_DELAY } from '../constants'
import { mapToTriggerNotifications, splitArray, filterNotificationsByDate, getMutex } from '../utils'

import NotificationQueue from './NotificationQueue'
import Scheduler from './NotificationScheduler'

const StorageAdapter = {
    getItem: getData,
    setItem: storeData,
}

async function scheduleSystemIOSNotification(fireDate) {
//    if (isAndroid) return;

    const localNotification = Scheduler.createLocalNotification({
        title: 'MindLogger' + ": " + new Date(fireDate).toString(),
        body: 'Tap to update the schedule',
        notificationId: SYSTEM_RESCHEDULING_NOTIFICATION_ID,
        data: {
            isLocal: true,
            type: "request-to-reschedule-dueto-limit",
            scheduledAt: fireDate,
            scheduledAtString: new Date(fireDate).toString()
        }
    });

    const trigger = {
        fireDate,
        repeatInterval: 'hour',
    }

    return Scheduler.scheduleLocalNotification(localNotification, trigger);
}

function NotificationManager() {
    const notificationQueue = NotificationQueue(StorageAdapter);

    async function restackNotifications(notifications, amount) {
        const [notificationsToSchedule, notificationsToQueue] = splitArray(notifications, amount);

        await notificationQueue.set(notificationsToQueue);

        const triggerNotifications = mapToTriggerNotifications(notificationsToSchedule);

        for (let item of triggerNotifications) {
          const { notification, trigger } = item;
          const localNotification = Scheduler.createLocalNotification(notification);

          await Scheduler.scheduleLocalNotification(localNotification, trigger)
        }

        console.log("restackNotifications", {
            amount,
            incommingInFunction: notifications,
            mappedForScheduleToApi: triggerNotifications,
            savedToQueue: notificationsToQueue
        });

        if (!triggerNotifications.length) return;
        if (triggerNotifications.length !== MAX_SCHEDULED_NOTIFICATIONS_SIZE) return;

        const lastTriggerNotification = triggerNotifications[triggerNotifications.length - 1];

        await scheduleSystemIOSNotification(lastTriggerNotification.trigger.fireDate + SYSTEM_NOTIFICATION_DELAY);
    }

    async function scheduleNotifications(notifications = []) {
        await Scheduler.cancelAllNotifications();
      
        await restackNotifications(notifications, MAX_SCHEDULED_NOTIFICATIONS_SIZE);
    }

    async function topUpNotificationsFromQueue() {
        return;
        const scheduledNotifications = await Scheduler.getAllScheduledNotifications();
        const freeSlotsCount = MAX_SCHEDULED_NOTIFICATIONS_SIZE - scheduledNotifications.length;
        const canScheduleMore = freeSlotsCount > 0;

        if (!canScheduleMore) return;

        const queuedNotifications = await notificationQueue.get();
        const filteredQueuedNotifications = filterNotificationsByDate(queuedNotifications, Date.now())

        await restackNotifications(filteredQueuedNotifications, freeSlotsCount);
    }

    function clearScheduledNotifications() {
        Scheduler.cancelAllNotifications();
        notificationQueue.clear();
    }

    return {
        scheduleNotifications,
        topUpNotificationsFromQueue,
        clearScheduledNotifications,
    }
}

export const NotificationManagerMutex = getMutex();

export default NotificationManager();