import { Platform } from 'react-native';
import firebase from 'react-native-firebase';
import { Actions } from "react-native-router-flux";

const SCENES_TO_PAUSE = ['take_act', 'activity_summary', 'activity_thanks', 'activity_flow_submit', 'activity_end'];

const CURRENT_ACTIVITY_CHECK_INTERVAL = 10000;

const NotificationTimeoutIds = new Map();

function NotificationRenderer() {
  async function renderNotification(notification) {
    try {
      await firebase.notifications().displayNotification(notification);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`FCM[${Platform.OS}]: error `, error);
    }
  }

  function canRenderNotification() {
    return !SCENES_TO_PAUSE.includes(Actions.currentScene);
  }

  function tryToRenderNotification(notification) {
    if (canRenderNotification()) {
      renderNotification(notification);
      NotificationTimeoutIds.delete(notification);
    } else {
      checkLater(notification);
    }
  }

  function checkLater(notification) {
    const timeoutId = setTimeout(async () => {
      tryToRenderNotification(notification);
    }, CURRENT_ACTIVITY_CHECK_INTERVAL);

    NotificationTimeoutIds.set(notification, timeoutId);
  }

  function render(notification) {
    tryToRenderNotification(notification);
  }

  function cancel(notification) {
    const timeoutId = NotificationTimeoutIds.get(notification);

    clearTimeout(timeoutId);
    NotificationTimeoutIds.delete(notification);
  }

  function getPostponedNotifications() {
    return Array.from(NotificationTimeoutIds.keys());
  }

  return {
    render,
    cancel,

    getPostponedNotifications,
  }
}

export default NotificationRenderer();
