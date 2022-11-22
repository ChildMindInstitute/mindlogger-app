import { BackgroundWorker } from './features/system'
import { NotificationManager } from './features/notifications'

function runBackgroundProcess() {
  BackgroundWorker.setAndroidHeadlessTask(async () => {
    await NotificationManager.topUpNotificationsFromQueue();

    debugScheduledNotifications({
      actionType: 'backgroundAddition',
    });
  })
}

export default runBackgroundProcess
