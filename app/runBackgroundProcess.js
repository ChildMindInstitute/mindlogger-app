import { Platform } from 'react-native'

import { BackgroundWorker } from './features/system'
import { NotificationManager } from './features/notifications'
import { debugScheduledNotifications } from './utils/debug-utils';
import { NotificationManagerMutex } from './features/notifications/services/NotificationManager';

const isAndroid12orHigher = Platform.Version > 30;

function runBackgroundProcess() {
  BackgroundWorker.setAndroidHeadlessTask(async () => {
    if (isAndroid12orHigher) return;

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
