import { PushNotificationIOS } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { Actions } from 'react-native-router-flux';
import { timeArrayFrom } from './pushNotificationSchedule';

export const initializePushNotifications = () => {
  PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: (token) => {
      console.log('TOKEN:', token);
    },

    // (required) Called when a remote or local notification is opened or received
    onNotification: (notification) => {
      console.log('NOTIFICATION:', notification);
      // process the notification
      // if (Platform.OS == 'ios') {
      //     this.onNotificationIOS(notification);
      // } else {
      //     this.onNotificationAndroid(notification);
      // }
      // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
      Actions.push('push_act', { notification });
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not
    // required for local notifications, but is need to receive remote push
    // notifications)
    // senderID: "YOUR GCM (OR FCM) SENDER ID",

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    visibility: 'public',

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
      * (optional) default: true
      * - Specified if permissions (ios) and token (android and ios) will requested or not,
      * - if not, you must call PushNotificationsHandler.requestPermissions() later
      */
    requestPermissions: true,
    actions: '["Yes", "No"]',
  });
};

export const scheduleNotifications = (
  acts,
  notifications = {},
  isReset = false,
) => {
  if (isReset) {
    PushNotification.cancelAllLocalNotifications();
  }

  const updatedNotifications = { ...notifications };
  acts.forEach((act, idx) => {
    if (!act.meta || typeof act.meta.notification === 'undefined') {
      return;
    }

    const state = notifications[act._id] || {};
    let { lastTime } = state;
    if (isReset) {
      lastTime = undefined;
    } else if (typeof lastTime !== 'undefined' && Date.now() < lastTime) {
      return;
    }

    const times = timeArrayFrom(act.meta.notification, Date.now());

    const message = `Please perform activity: ${act.name}`;
    const userInfo = { actId: act._id };
    if (times.length > 0) {
      times.forEach((time) => {
        if (lastTime === undefined || time.getTime() > lastTime) {
          PushNotification.localNotificationSchedule({
            message, // (required)
            tag: `${idx}`,
            data: userInfo,
            userInfo,
            date: time,
          });
          lastTime = time.getTime();
        }
      });
    }
    updatedNotifications[act._id] = { modifiedAt: Date.now(), name: act.name, lastTime, times };
  });

  return updatedNotifications;
};
