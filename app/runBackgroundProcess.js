import { BackgroundWorker } from './features/system'
import { NotificationManager } from './features/notifications'
import { debugScheduledNotifications } from './utils/debug-utils';
import { NotificationManagerMutex } from './features/notifications/services/NotificationManager';

function runBackgroundProcess() {
  BackgroundWorker.setAndroidHeadlessTask(async () => {
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

    } finally {
      NotificationManagerMutex.release();
    }
  })
}

export default runBackgroundProcess
