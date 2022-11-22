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

export async function debugScheduledNotifications(additionalPayload) {
    const queuedNotifications = await notificationQueue.get()
    const scheduledNotifications = await NotificationScheduler.getAllScheduledNotifications();
    const { fcmToken, email } = await userInfoStorage.get()

    addScheduleNotificationDebugObjects({
        userId: email,
        actionType: 'totalReschedule',
        deviceId: fcmToken,
        notificationsInQueue: queuedNotifications,
        scheduledNotifications,
        ...additionalPayload,
    });
}