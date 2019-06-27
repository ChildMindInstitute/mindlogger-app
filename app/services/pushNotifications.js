import { PushNotificationIOS } from 'react-native';
import PushNotification from 'react-native-push-notification';

export const initializePushNotifications = (onNotification) => {
  PushNotification.configure({
    onNotification: (notification) => {
      if (typeof onNotification !== 'undefined') {
        onNotification(notification); // Callback
      }
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    onRegister() {

    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    visibility: 'public',
    popInitialNotification: true,
    requestPermissions: true,
    actions: '["Yes", "No"]',
  });
};

export const scheduleNotifications = (activities) => {
  PushNotification.cancelAllLocalNotifications();
  // const now = moment();
  // const lookaheadDate = moment().add(1, 'month');

  const notifications = [];

  for (let i = 0; i < activities.length; i += 1) {
    const activity = activities[i];
    const scheduleDateTimes = activity.notification || [];
    console.log('activitiy', activity);
    scheduleDateTimes.forEach((dateTime) => {
      notifications.push({
        timestamp: dateTime.valueOf(),
        niceTime: dateTime.format(),
        activityId: activity._id,
        activityName: activity.name.en,
        appletName: activity.appletName,
      });
    });
  }

  // Sort notifications by timestamp
  notifications.sort((a, b) => a.timestamp - b.timestamp);

  // Schedule the notifications
  notifications.forEach((notification) => {
    console.log('scheduling', notification);
    PushNotification.localNotificationSchedule({
      message: `Please perform activity: ${notification.activityName}`,
      id: notification.tag,
      date: new Date(notification.timestamp),
      group: notification.activityName,
    });
  });

  return notifications;
};
