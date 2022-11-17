import firebase from 'react-native-firebase';

import { isAndroid, ANDROID_DEFAULT_CHANNEL_ID } from '../constants'

function NotificationScheduler() {
    function createLocalNotification({
        notificationId,
        title,
        body,
        data,
        subtitle,
    }) {
        if (!notificationId) throw Error('[NotificationScheduler] notificationId is required');

        const notification = new firebase.notifications.Notification()
            .setNotificationId(notificationId)
            .setTitle(title)
            .setBody(body)
            .setSound('default')
            .setData(data)
            .setSubtitle(subtitle ?? null)

        if (isAndroid) {
            notification.android.setChannelId(ANDROID_DEFAULT_CHANNEL_ID);
            notification.android.setPriority(firebase.notifications.Android.Priority.High);
            notification.android.setAutoCancel(true);
        } else {
            notification.ios.setBadge(iosBadge);
        }

        return notification;
    }

    function scheduleLocalNotification(notification, options) {
        if (!notification) throw Error('[NotificationScheduler] notification is required');
        if (!options?.fireDate) throw Error('[NotificationScheduler] fireDate option is required');

        const { fireDate, repeatInterval } = options;

        return firebase.notifications()
            .scheduleNotification(notification, {
                fireDate,
                repeatInterval,
            })
    }

    function getAllScheduledNotifications() {
        return firebase.notifications().getScheduledNotifications();
    }

    async function getScheduledNotification(notificationId) {
        if (!notificationId) throw Error('[NotificationScheduler: getScheduledNotification] notificationId is required')

        const notifications = await getAllScheduledNotifications();

        const notification = notifications.find(notification => notification.notificationId === notificationId);

        return notification;
    }

    function cancelAllNotifications() {
        firebase.notifications().cancelAllNotifications();
    }

    function cancelNotification(notificationId) {
        if (!notificationId) throw Error('[NotificationScheduler: cancelNotification] notificationId is required')

        firebase.notifications().cancelNotification(notificationId);
    }

    return {
        createLocalNotification,
        scheduleLocalNotification,

        getScheduledNotification,
        getAllScheduledNotifications,

        cancelNotification,
        cancelAllNotifications,
    }
}

export default NotificationScheduler();