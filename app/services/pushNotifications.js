import { PushNotificationIOS, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
// import moment from 'moment';

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

// if (Platform.OS == "ios") {
//   PushNotificationIOS.setApplicationIconBadgeNumber((num) => {
//     numBadge = num + 1;
//     PushNotification.localNotification({
//       number: numBadge,
//     });
//     console.log("number of budge count", numBadge)
//   });
// }

export const scheduleNotifications = (activities) => {
  PushNotificationIOS.setApplicationIconBadgeNumber(1)
  PushNotification.cancelAllLocalNotifications();
  // const now = moment();
  // const lookaheadDate = moment().add(1, 'month');

  const notifications = [];

  for (let i = 0; i < activities.length; i += 1) {
    const activity = activities[i];
    console.log("activity", activity)
    const scheduleDateTimes = activity.notification || [];

    // /* below is for easy debugging.
    //    every 30 seconds a notification will appear for an applet.
    // */
    // const scheduleDateTimes = [];

    // for (i = 0; i < 50; i += 1) {
    //   const foo = new Date();
    //   foo.setSeconds(foo.getSeconds() + i * 30);
    //   scheduleDateTimes.push(moment(foo));
    // }
    // console.log('activity', activity);
    // /* end easy debugging section */

    scheduleDateTimes.forEach((dateTime) => {
      let ugctime = new Date(dateTime.valueOf())
      console.log("ugctime", ugctime)
      notifications.push({
        timestamp: ugctime,
        niceTime: dateTime.format(),
        activityId: activity.id,
        activityName: activity.name.en,
        appletName: activity.appletName,
        activity: JSON.stringify(activity),
      });
    });
  }

  // Sort notifications by timestamp
  notifications.sort((a, b) => a.timestamp - b.timestamp);

  // Schedule the notifications
  notifications.forEach((notification) => {
    console.log('scheduling', notification.timestamp);
    PushNotification.localNotificationSchedule({
      message: `Please perform activity: ${notification.activityName}`,
      date: notification.timestamp,
      group: notification.activityName,
      vibrate: true,
      userInfo: {
        id: notification.activityId,
        activity: notification.activity,
      },
      // android only (notification.activity is already stringified)
      data: notification.activity,
    });
  });

  return notifications;
};
