import { Platform } from 'react-native'

import { BackgroundWorker } from './features/system'
import { NotificationManager } from './features/notifications'
import { debugScheduledNotifications } from './utils/debug-utils';
import { NotificationManagerMutex } from './features/notifications/services/NotificationManager';

import { canSupportNotifications } from './utils/constants'

function runBackgroundProcess() {
  BackgroundWorker.setAndroidHeadlessTask(async () => {
    if (!canSupportNotifications) return;

    if (NotificationManagerMutex.isBusy()) {
      console.warn(
        "[BackgroundWorker.setAndroidHeadlessTask]: NotificationManagerMutex is busy. Operation rejected"
      );
      return;
    }
    try {
      NotificationManagerMutex.setBusy();

      await NotificationManager.topUpNotificationsFromQueue();

      await debugScheduledNotifications({
        actionType: 'backgroundAddition-runBackgroundProcess',
      });
    }
    catch (err) {
      console.warn("[BackgroundWorker.setAndroidHeadlessTask]: Error occured. ", err);
    }
    finally {
      NotificationManagerMutex.release();
    }
  })
}

export default runBackgroundProcess
