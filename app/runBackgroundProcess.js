import { BackgroundWorker } from './features/system'
import { NotificationManager } from './features/notifications'
import { debugScheduledNotifications } from './utils/debug-utils';

function runBackgroundProcess() {
  BackgroundWorker.setAndroidHeadlessTask(async () => {
    await NotificationManager.topUpNotificationsFromQueue();

    await debugScheduledNotifications({
      actionType: 'backgroundAddition-runBackgroundProcess',
    });
  })
}

export default runBackgroundProcess
