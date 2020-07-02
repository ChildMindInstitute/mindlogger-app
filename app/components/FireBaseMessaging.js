import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import * as firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform, AppState, AppStateStatus } from 'react-native';

import { setFcmToken } from '../state/fcm/fcm.actions';

const AndroidChannelId = 'MindLoggerChannelId';
const fMessaging = firebase.messaging.nativeModuleExists && firebase.messaging();
const fNotifications = firebase.notifications.nativeModuleExists && firebase.notifications();

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

class FireBaseMessaging extends Component {
  state = { appState: AppState.currentState };

  async componentDidMount() {
    const result = await fNotifications.getInitialNotification();
    console.log({ result });
    if (result) {
      console.log('fires correctly.');
      PushNotificationIOS.getApplicationIconBadgeNumber(prevBages => console.log({ prevBages }));
    }
    
    AppState.addEventListener('change', this.handleAppStateChange);

    this.initAndroidChannel();
    this.notificationDisplayedListener = fNotifications
      .onNotificationDisplayed(this.onNotificationDisplayed);
    this.notificationListener = fNotifications
      .onNotification(this.onNotification);
    this.notificationOpenedListener = fNotifications
      .onNotificationOpened(this.onNotificationOpened);
    this.onTokenRefreshListener = fMessaging
      .onTokenRefresh(this.onTokenRefresh);
    this.messageListener = fMessaging
      .onMessage(this.onMessage);

    fMessaging.hasPermission().then((granted) => {
      if (!granted) {
        fMessaging.requestPermission();
      }
    });

    const fcmToken = await fMessaging.getToken();

    this.props.setFCMToken(fcmToken);

    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}] fcmToken: ${fcmToken}`);

    if (isIOS) {
      await firebase.messaging().ios.registerForRemoteNotifications();
      const apns = await firebase.messaging().ios.getAPNSToken();

      // eslint-disable-next-line no-console
      console.log(`FCM[${Platform.OS}] APNSToken: ${apns}`);
    }
  }

  componentWillUnmount() {
    this.notificationDisplayedListener();
    this.notificationListener();
    this.notificationOpenedListener();
    this.onTokenRefreshListener();
    this.messageListener();

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState: AppStateStatus) => {
    const isAppStateChanged = this.state.appState !== nextAppState;

    if (isAppStateChanged) {
      // firebase.notifications().setBadge(6);
    }

    this.setState({ appState: nextAppState });
  }

  initAndroidChannel = () => {
    if (Platform.OS === 'android') {
      const channel = new firebase.notifications.Android.Channel(
        AndroidChannelId,
        'MindLogger Channel',
        firebase.notifications.Android.Importance.Max,
      ).setDescription('MindLogger Channel');

      // Create the channel
      firebase.notifications().android.createChannel(channel).then(() => {
        // eslint-disable-next-line no-console
        console.log(`FCM[${Platform.OS}]: Android channel created successful`, channel);
      });
    }
  };

  onNotificationDisplayed = (notification: firebase.RNFirebase.notifications.Notification) => {
    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: onNotificationDisplayed`, notification);
  };

  onNotification = (notification: firebase.RNFirebase.notifications.Notification) => {
    // eslint-disable-next-line no-console
    console.log('onNotification', { notification });

    const localNotification = this.newNotification({
      notificationId: notification.notificationId,
      title: notification.title,
      subtitle: notification.subtitle,
      body: notification.body,
      data: notification.data,
      iosBadge: notification.ios.badge,
    });

    firebase.notifications().displayNotification(localNotification).catch((error) => {
      // eslint-disable-next-line no-console
      console.warn(`FCM[${Platform.OS}]: error `, error);
    });
  };

  onNotificationOpened = (notificationOpen: firebase.RNFirebase.notifications.NotificationOpen) => {
    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: onNotificationOpened `, notificationOpen);
    // firebase.notifications().setBadge(0);
  };

  onTokenRefresh = (fcmToken: string) => {
    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: onTokenRefresh: ${fcmToken}`);
    const { setFCMToken } = this.props;
    setFCMToken(fcmToken);
  };

  onMessage = (message: firebase.RNFirebase.messaging.RemoteMessage) => {
    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: onMessage: `, message, message.data);
    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: message.data: ${message.data}`);
    const { data } = message;

    PushNotificationIOS.getApplicationIconBadgeNumber((prevBadges = 0) => {
      const localNotification = this.newNotification({
        notificationId: message.messageId,
        title: data.title || 'Push Notification',
        subtitle: data.subtitle || null,
        data,
        iosBadge: prevBadges + 1,
      });

      firebase.notifications().displayNotification(localNotification).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn(`FCM[${Platform.OS}]: error `, error);
      });

    });
  };

  newNotification = ({ notificationId, title, subtitle, body, iosBadge = 1, data }) => {
    const localNotification = new firebase.notifications.Notification()
      .setNotificationId(notificationId)
      .setTitle(title)
      .setBody(body)
      .setSound('default')
      .setData(data);

    if (subtitle) {
      localNotification.setSubtitle(subtitle);
    }

    if (isAndroid) {
      localNotification.android.setChannelId(AndroidChannelId);
      localNotification.android.setPriority(firebase.notifications.Android.Priority.High);
      localNotification.android.setAutoCancel(true);
    } else if (isIOS) {
      localNotification.ios.setBadge(iosBadge);
    }
    return localNotification;
  };

  render() {
    const { children } = this.props;

    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }
}

FireBaseMessaging.propTypes = {
  children: PropTypes.node.isRequired,
  setFCMToken: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  setFCMToken: (token) => {
    dispatch(setFcmToken(token));
  },

});

export default connect(null, mapDispatchToProps)(FireBaseMessaging);
