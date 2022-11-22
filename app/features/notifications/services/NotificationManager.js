import { getData, storeData } from '../../../services/storage'

import { MAX_SCHEDULED_NOTIFICATIONS_SIZE, isAndroid, SYSTEM_RESCHEDULING_NOTIFICATION_ID, SYSTEM_NOTIFICATION_DELAY } from '../constants'
import { mapToTriggerNotifications, splitArray, filterNotificationsByDate } from '../utils'

import NotificationQueue from './NotificationQueue'
import Scheduler from './NotificationScheduler'

const StorageAdapter = {
    getItem: getData,
    setItem: storeData,
}

function scheduleSystemIOSNotification(fireDate) {
    if (isAndroid) return;

    const localNotification = Scheduler.createLocalNotification({
        title: 'MindLogger',
        body: 'Tap to update the schedule',
        notificationId: SYSTEM_RESCHEDULING_NOTIFICATION_ID,
        data: {
            is_local: true,
            is_trigger_for_rescheduling: true,
        }
    });

    const trigger = {
        fireDate,
        repeatInterval: 'hour',
    }

    Scheduler.scheduleLocalNotification(localNotification, trigger);
}

function NotificationManager() {
    const notificationQueue = NotificationQueue(StorageAdapter);

    async function restackNotifications(notifications, amount) {
        const [notificationsToSchedule, notificationsToQueue] = splitArray(notifications, amount);

        await notificationQueue.set(notificationsToQueue);

        const triggerNotifications = mapToTriggerNotifications(notificationsToSchedule);

        triggerNotifications.forEach(({ notification, trigger }) => {
            const localNotification = Scheduler.createLocalNotification(notification);

            Scheduler.scheduleLocalNotification(localNotification, trigger)
        });

        console.log({
            notifications,
            notificationsToSchedule,
            notificationsToQueue,
            triggerNotifications,
        })

        const lastTriggerNotification = triggerNotifications[triggerNotifications.length - 1];

        scheduleSystemIOSNotification(lastTriggerNotification.trigger.fireDate + SYSTEM_NOTIFICATION_DELAY);
    }

    async function scheduleNotifications(notifications = []) {
        if (!notifications.length) return;

        Scheduler.cancelAllNotifications();

        await restackNotifications(notifications, MAX_SCHEDULED_NOTIFICATIONS_SIZE);
    }

    async function topUpNotificationsFromQueue() {
        const scheduledNotifications = await Scheduler.getAllScheduledNotifications();
        const freeSlotsCount = MAX_SCHEDULED_NOTIFICATIONS_SIZE - scheduledNotifications.length;
        const canScheduleMore = freeSlotsCount > 0;

        if (!canScheduleMore) return;

        const queuedNotifications = await notificationQueue.get();
        const filteredQueuedNotifications = filterNotificationsByDate(queuedNotifications, Date.now())

        if (!filteredQueuedNotifications.length) return;

        await restackNotifications(filteredQueuedNotifications, freeSlotsCount);
    }

    return {
        scheduleNotifications,
        topUpNotificationsFromQueue,
    }
}

export default NotificationManager();