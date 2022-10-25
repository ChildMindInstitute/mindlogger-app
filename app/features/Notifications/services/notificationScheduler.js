import PushNotification from "react-native-push-notification";

import notificationService from './notificationService'

async function scheduleLocalNotification(
    {
      message = "",
      title,
      data,
      notificationTag,
      picture,
      actions = [],
      playSound = true,
      invokeApp = true,
      vibrate = true,
      allowWhileIdle = false,
    },
    { repeatType, date } = {}
  ) {
    if (!notificationTag)
      throw Error("[notificationService] notificationTag is required.");
  
    await notificationService.createChannel({
      channelId: notificationTag,
      channelName: 'internal channel'
    });
  
    PushNotification.localNotificationSchedule({
      message,
      title,
      data,
      category: notificationTag,
      channelId: notificationTag,
      date,
      picture,
      actions,
      playSound,
      invokeApp,
      allowWhileIdle,
      repeatType,
      date,
      vibrate,
    });
  }
  
  function scheduleLocalDataNotification(
    { data, notificationTag },
    { repeatType, date } = {}
  ) {
    if (!data)
      throw Error(
        "[notificationService]: data is required and must be plain object"
      );
  
    return scheduleLocalNotification({
      message: "",
      data,
      notificationTag: `${DATA_NOTIFICATION_PREFIX}${notificationTag}`,
      repeatType,
      date,
      vibrate: false,
      playSound: false,
      invokeApp: false,
      allowWhileIdle: true,
    });
  }

  export default {
    scheduleLocalNotification,
    scheduleLocalDataNotification,
  }