import moment from 'moment'

export function mapToTriggerNotifications(notifications = []) {
    return notifications.map(notification => ({
        notification: {
            title: notification.notificationHeader,
            body: notification.notificationBody,
            notificationId: notification.notificationId,
            data: {
                applet_id: notification.appletId,
                activity_id: notification.activityId,
                activity_flow_id: notification.activityId,
                event_id: notification.eventId,
                is_local: true,
                type: notification.type
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

