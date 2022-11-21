import moment from 'moment'

export function mapToTriggerNotifications(notifications = []) {
    return notifications.map(notification => ({
        notification: {
            title: notification.notificationHeader,
            body: notification.notificationBody,
            notificationId: notification.notificationId,
            data: {
                appletId: notification.appletId,
                activityId: notification.activityId,
                activityFlowId: notification.activityId,
                eventId: notification.eventId,
                isLocal: true,
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

export function splitArray(leftArraySize) {
    if (!leftArraySize) throw Error('[splitArray] leftArraySize is required');
    if (typeof leftArraySize !== 'number') throw Error('[splitArray] leftArraySize must be number');

    const rightArray = [...array];

    const leftArray = rightArray.splice(0, leftArraySize);

    return [leftArray, rightArray];
}

