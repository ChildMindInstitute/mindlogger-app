import EncryptedStorage from 'react-native-encrypted-storage'

import { UserInfoStorage } from '../features/system'
import { NotificationScheduler, NotificationQueue } from '../features/notifications'

import { addScheduleNotificationDebugObjects } from '../services/network'
import { getData, storeData } from '../services/storage'

const StorageAdapter = {
  getItem: getData,
  setItem: storeData,
} 

const notificationQueue = NotificationQueue(StorageAdapter);
const userInfoStorage = UserInfoStorage(EncryptedStorage);

export const getStringHashCode = inputString => {
  if (!inputString ) {
    throw new Error("[getStringHashCode] inputString is not defined");
  }
  let result = 0
  for (let i = 0; i < inputString.length; i++) {
    result = Math.imul(31, result) + inputString.charCodeAt(i)
  }
  return Math.abs(result);
}

export async function debugScheduledNotifications(additionalPayload) {
    const queuedNotifications = await notificationQueue.get()
    const scheduledNotifications = await NotificationScheduler.getAllScheduledNotifications();
    const { fcmToken, email } = await userInfoStorage.get()

    addScheduleNotificationDebugObjects({
        userId: email,
        actionType: 'undefined',
        deviceId: getStringHashCode(fcmToken).toString(),
        notificationsInQueue: queuedNotifications,
        scheduledNotifications,
        ...additionalPayload,
    });
}