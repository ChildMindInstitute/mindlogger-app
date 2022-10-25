import { Platform } from "react-native";
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import PushNotification, { Importance } from "react-native-push-notification";

const DATA_NOTIFICATION_PREFIX = "data-notification:";

const isFunction = (maybeFunction) => typeof maybeFunction === "function";

function initialize() {
  PushNotification.configure({
    onNotification: (notification) => {
      Promise.resolve()
        .then(
          () =>
            isFunction(this.onNotification) && this.onNotification(notification)
        )
        .then(() => notification.finish(PushNotificationIOS.FetchResult.NoData));
    },
    onAction: (notification) => {
      if (isFunction(this.onAction)) {
        this.onAction(notification);
      }
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    requestPermissions: true,
  });

  PushNotificationIOS.requestPermissions();
}

function createChannel({ channelId, channelName, playSound = true }) {
  if (!channelId) throw Error("[notificationService]: channelId is required");
  if (!channelName)
    throw Error("[notificationService]: channelName is required");

  return new Promise((resolve) => {
    if (Platform.OS === 'ios') resolve();

    PushNotification.createChannel(
      {
        channelId,
        channelName,
        playSound,
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => {
        debugger
        resolve(created)
      }
    );
  });
}

function getNotificationTag(notification) {
  if (!notification)
    throw Error("[notificationService]: notification is required");
  if (typeof notification !== "object")
    throw Error("[notificationService]: notification must be object");

  return Platform.OS === "ios" ? notification.channelId : notification.category;
}

function cancelLocalNotification(notificationId) {
  PushNotification.cancelLocalNotification(notificationId);
}

function cancelAllLocalNotifications() {
  PushNotification.cancelAllLocalNotifications();
}

function removeDeliveredNotifications(identifiers = []) {
  if (!identifiers.length)
    throw Error(
      "[notificationService]: identifiers array must have at least one id"
    );

  PushNotification.removeDeliveredNotifications(identifiers);
}

function removeAllDeliveredNotifications() {
  PushNotification.removeAllDeliveredNotifications();
}

function getDeliveredNotifications() {
  return new Promise((resolve) =>
    PushNotification.getDeliveredNotifications(resolve)
  );
}

function getScheduledLocalNotifications() {
  return new Promise((resolve) =>
    PushNotification.getScheduledLocalNotifications(resolve)
  );
}

async function getScheduledNotDataLocalNotifications() {
  const notifications = await getScheduledLocalNotifications();

  return notifications.filter((notification) =>
    getNotificationTag(notification).includes(DATA_NOTIFICATION_PREFIX)
  );
}

function checkPermission() {
  return new Promise((resolve) => PushNotification.checkPermission(resolve));
}

function requestPermissions() {
  return PushNotification.requestPermissions();
}

function attachOnNotification(handler) {
  if (!isFunction(handler))
    throw Error("[notificationService]: handler must be function");

  this.onNotification = handler;
}

function attachOnAction(handler) {
  if (!isFunction(handler))
    throw Error("[notificationService]: handler must be function");

  this.onAction = handler;
}

function onLocalNotification(callback) {
  PushNotificationIOS.addEventListener('localNotification', callback);

  const unsubscribe = () => PushNotificationIOS.removeEventListener('localNotification')

  return unsubscribe;
}

function onRemoteNotification(callback) {
  PushNotificationIOS.addEventListener('notification', callback);

  const unsubscribe = () => PushNotificationIOS.removeEventListener('notification')

  return unsubscribe;
}

const notificationService = {
  initialize,
  checkPermission,
  requestPermissions,

  createChannel,

  getDeliveredNotifications,
  getScheduledLocalNotifications,
  getScheduledNotDataLocalNotifications,

  cancelLocalNotification,
  cancelAllLocalNotifications,
  removeDeliveredNotifications,
  removeAllDeliveredNotifications,

  attachOnNotification,
  attachOnAction,

  onLocalNotification,
  onRemoteNotification,
};

export default notificationService;
