import { noop } from 'lodash'

function fakeSubscribe() {
  return noop;
}

function notifications() {
  return {
    onNotification: fakeSubscribe,
    onNotificationDisplayed: fakeSubscribe,
    onNotificationOpened: fakeSubscribe,
    getInitialNotification: () => Promise.resolve(),
  }
}

function messaging() {
  return {
    onTokenRefresh: fakeSubscribe,
    onMessage: fakeSubscribe,
    getToken: () => Promise.resolve(),
    hasPermission: () => Promise.resolve(true),
    requestPermission: () => Promise.resolve(),
  }
}

export default {
  notifications,
  messaging,
}