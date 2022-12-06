import { Platform } from 'react-native';
import firebase from 'react-native-firebase';

function NotificationRenderer() {
  async function render(notification) {
    try {
      await firebase.notifications().displayNotification(notification);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`FCM[${Platform.OS}]: error `, error);
    }
  }

  return {
    render,
  }
}

export default NotificationRenderer();
