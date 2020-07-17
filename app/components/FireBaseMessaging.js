import React, { Component, Fragment } from 'react';
import { Alert, Platform, AppState, AppStateStatus, Linking } from 'react-native';
import PropTypes from 'prop-types';
import * as firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import _ from 'lodash';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import { setFcmToken } from '../state/fcm/fcm.actions';
import { appletsSelector } from '../state/applets/applets.selectors';
import { setCurrentApplet } from '../state/app/app.actions';
import { startResponse } from '../state/responses/responses.thunks';
import { inProgressSelector } from '../state/responses/responses.selectors';

const AndroidChannelId = 'MindLoggerChannelId';
const fMessaging = firebase.messaging.nativeModuleExists && firebase.messaging();
const fNotifications = firebase.notifications.nativeModuleExists && firebase.notifications();

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

class FireBaseMessaging extends Component {
  state = { appState: AppState.currentState };

  async componentDidMount() {
    const result = await fNotifications.getInitialNotification();
    if (result) {
      this.openActivityByEventId(result);
    }

    AppState.addEventListener('change', this.handleAppStateChange);
    this.initAndroidChannel();
    this.notificationDisplayedListener = fNotifications
      .onNotificationDisplayed(this.onNotificationDisplayed);
    this.notificationListener = fNotifications.onNotification(this.onNotification);
    this.notificationOpenedListener = fNotifications
      .onNotificationOpened(this.onNotificationOpened);
    this.onTokenRefreshListener = fMessaging.onTokenRefresh(this.onTokenRefresh);
    this.messageListener = fMessaging.onMessage(this.onMessage);

    fMessaging.hasPermission().then((granted) => {
      if (!granted) {
        fMessaging.requestPermission()
          .then(() => this.checkPermissionAgain())
          .catch(() => this.checkPermissionAgain());
      }
    });

    const fcmToken = await fMessaging.getToken();

    this.props.setFCMToken(fcmToken);

    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}] fcmToken: ${fcmToken}`);

    if (isIOS) {
      await firebase.messaging().ios.registerForRemoteNotifications();
      // const apns = await firebase.messaging().ios.getAPNSToken();

      // eslint-disable-next-line no-console
      // console.log(`FCM[${Platform.OS}] APNSToken: ${apns}`);
    }
  }

  componentWillUnmount() {
    if (this.notificationDisplayedListener) {
      this.notificationDisplayedListener();
    }
    if (this.notificationListener) {
      this.notificationListener();
    }
    if (this.notificationOpenedListener) {
      this.notificationOpenedListener();
    }
    if (this.onTokenRefreshListener) {
      this.onTokenRefreshListener();
    }
    if (this.messageListener) {
      this.messageListener();
    }

    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  checkPermissionAgain = () => {
    fMessaging.hasPermission().then((granted) => {
      if (!granted) {
        Alert.alert(
          '"MindLogger" would like to send you notifications',
          'These can be configured in Settings',
          [
            {
              text: 'Dismiss',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: this.openSettings,
              style: 'default',
            },
          ],
        );
      }
    });
  }

  openSettings = () => Linking.openSettings();

  isCompleted = activity => activity.lastResponseTimestamp !== null
    && activity.nextScheduledTimestamp === null
    && (moment().isSame(moment(activity.lastResponseTimestamp), 'day'));

  isActivityCompleted = (currentApplet, currentActivity) => {
    const inProgressKeys = Object.keys(this.props.inProgress);
    if (inProgressKeys) {
      const isActivityNotInProgress = !inProgressKeys
        .includes(currentApplet.id + currentActivity.id);
      if (isActivityNotInProgress) {
        return this.isCompleted(currentActivity);
      }
      return false;
    }
    return this.isCompleted(currentActivity);
  };

  openActivityByEventId = (notificationObj) => {
    const eventId = _.get(notificationObj, 'notification._data.event_id', '');
    const appletId = _.get(notificationObj, 'notification._data.applet_id', '');
    const activityId = _.get(notificationObj, 'notification._data.activity_id', '');
    // eslint-disable-next-line no-console
    console.log('openActivityByEventId', { eventId, appletId, activityId });

    if (eventId && appletId && activityId) {
      const currentApplet = this.props.applets.find(applet => applet.id === `applet/${appletId}`);
      if (!currentApplet) {
        Alert.alert('Applet was not found', 'There is no applet for given id.');
        return;
      }
      const currentActivity = currentApplet.activities.find(activity => activity.id === `activity/${activityId}`);
      if (!currentActivity) {
        Alert.alert('Activity was not found', 'There is no activity for given id.');
        return;
      }

      const isActivityCompleted = this.isActivityCompleted(currentApplet, currentActivity);
      this.props.setCurrentApplet(`applet/${appletId}`);

      if (isActivityCompleted) {
        Actions.push('applet_details', { initialTab: 'data' });
        Alert.alert('', `You have already completed ‘${currentActivity.name.en}’`);
        return;
      }
      Actions.push('applet_details');

      const deltaTime = new Date().getTime()
        - (currentActivity.nextScheduledTimestamp?.getTime() ?? 0);

      if (currentActivity.nextAccess || deltaTime >= 0) {
        this.props.startResponse(currentActivity);
      } else {
        const time = moment(currentActivity.nextScheduledTimestamp).format('HH:mm');
        Alert.alert('Activity not ready', `You’re not able to start activity yet, ‘${currentActivity.name.en}’ is scheduled to start at ${time} today`);
      }
    }
  }

  handleAppStateChange = (nextAppState: AppStateStatus) => {
    const isAppStateChanged = this.state.appState !== nextAppState;
    if (isAppStateChanged) {
      this.setState({ appState: nextAppState });
      if (isIOS) {
        this.updateApplicationIconBadgeNumber();
      }
    }
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

  onNotificationDisplayed = async (
    notification: firebase.RNFirebase.notifications.Notification,
  ) => {
    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: onNotificationDisplayed`, notification);
    if (isIOS) {
      await this.updateApplicationIconBadgeNumber();
    }
  };

  getDeliveredNotificationsCount = ():Promise<number> => new Promise((resolve) => {
    PushNotificationIOS.getDeliveredNotifications((notifications) => {
      resolve(notifications.length);
    });
  });

  getScheduledLocalNotificationsCount = ():Promise<number> => new Promise((resolve) => {
    PushNotificationIOS.getScheduledLocalNotifications((notifications) => {
      resolve(notifications.length);
    });
  });

  onNotification = async (notification: firebase.RNFirebase.notifications.Notification) => {
    // eslint-disable-next-line no-console
    console.log('onNotification', { notification });

    const localNotification = this.newNotification({
      notificationId: notification.notificationId,
      title: notification.title,
      subtitle: notification.subtitle,
      body: notification.body,
      data: notification.data,
      // iosBadge: notification.ios.badge,
    });

    if (isIOS) {
      const notificationsCount = await this.generateApplicationIconBadgeNumber();
      localNotification.ios.setBadge(notificationsCount);
    }

    firebase.notifications().displayNotification(localNotification).catch((error) => {
      // eslint-disable-next-line no-console
      console.warn(`FCM[${Platform.OS}]: error `, error);
    });
  };

  onNotificationOpened = async (
    notificationOpen: firebase.RNFirebase.notifications.NotificationOpen,
  ) => {
    // eslint-disable-next-line no-console
    this.openActivityByEventId(notificationOpen);

    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: onNotificationOpened `, notificationOpen);
    if (isIOS) {
      await this.updateApplicationIconBadgeNumber();
    }
  };

  updateApplicationIconBadgeNumber = async () => {
    const iconBadgeNumber = await this.generateApplicationIconBadgeNumber();
    PushNotificationIOS.setApplicationIconBadgeNumber(iconBadgeNumber);
  }

  generateApplicationIconBadgeNumber = async () => {
    const deliveredNotificationsCount = await this.getDeliveredNotificationsCount();
    const scheduledLocalNotificationsCount = await this.getScheduledLocalNotificationsCount();
    return deliveredNotificationsCount + scheduledLocalNotificationsCount;
  };

  onTokenRefresh = (fcmToken: string) => {
    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: onTokenRefresh: ${fcmToken}`);
    const { setFCMToken } = this.props;
    setFCMToken(fcmToken);
  };

  onMessage = async (message: firebase.RNFirebase.messaging.RemoteMessage) => {
    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: onMessage: `, message, message.data);
    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: message.data: ${message.data}`);
    const { data } = message;

    const localNotification = this.newNotification({
      notificationId: message.messageId,
      title: data.title || 'Push Notification',
      subtitle: data.subtitle || null,
      data,
      // iosBadge: prevBadges + 1,
    });
    if (isIOS) {
      const notificationsCount = await this.generateApplicationIconBadgeNumber();
      localNotification.ios.setBadge(notificationsCount + 1);
    }
    firebase.notifications().displayNotification(localNotification).catch((error) => {
      // eslint-disable-next-line no-console
      console.warn(`FCM[${Platform.OS}]: error `, error);
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
  applets: PropTypes.array.isRequired,
  inProgress: PropTypes.array.isRequired,
  setCurrentApplet: PropTypes.func.isRequired,
  startResponse: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  inProgress: inProgressSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setFCMToken: (token) => {
    dispatch(setFcmToken(token));
  },
  setCurrentApplet: id => dispatch(setCurrentApplet(id)),
  startResponse: activity => dispatch(startResponse(activity)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FireBaseMessaging);
