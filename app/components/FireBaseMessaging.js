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
import { setCurrentApplet, setAppStatus } from '../state/app/app.actions';
import { startResponse } from '../state/responses/responses.thunks';
import { inProgressSelector } from '../state/responses/responses.selectors';
import { updateBadgeNumber } from '../state/applets/applets.thunks';
import { syncTargetApplet, sync } from '../state/app/app.thunks';

const AndroidChannelId = 'MindLoggerChannelId';
const fMessaging = firebase.messaging.nativeModuleExists && firebase.messaging();
const fNotifications = firebase.notifications.nativeModuleExists && firebase.notifications();

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

class FireBaseMessaging extends Component {
  async componentDidMount() {
    this.appState = 'active';

    const event = await fNotifications.getInitialNotification();
    if (event) {
      this.openActivityByEventId(event);
    }

    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
    if (isAndroid) {
      this.initAndroidChannel();
    }
    this.notificationDisplayedListener = fNotifications
      .onNotificationDisplayed(this.onNotificationDisplayed);
    this.notificationListener = fNotifications.onNotification(this.onNotification);
    this.notificationOpenedListener = fNotifications
      .onNotificationOpened(this.onNotificationOpened);
    this.onTokenRefreshListener = fMessaging.onTokenRefresh(this.onTokenRefresh);
    this.messageListener = fMessaging.onMessage(this.onMessage);

    const permission = await fMessaging.hasPermission();

    if (!permission) {
      await fMessaging.requestPermission();
      this.checkPermissionAgain();
    }

    this.props.setFCMToken(await fMessaging.getToken());

    if (isIOS) {
      firebase.messaging().ios.registerForRemoteNotifications();
      // const apns = await firebase.messaging().ios.getAPNSToken();
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

    AppState.removeEventListener('change', this.handleAppStateChange.bind(this));
  }

  checkPermissionAgain = async () => {
    const permission = await fMessaging.hasPermission();
    if (!permission) {
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
  }

  openSettings = () => Linking.openSettings();

  isCompleted = activity => activity.lastResponseTimestamp
    && !activity.nextScheduledTimestamp
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

  findActivityById = (eventId, currentApplet, activityId) => {
    const currentActivity = currentApplet.activities.find(activity => activity.id === `activity/${activityId}`);
    if (currentActivity) {
      return currentActivity;
    }
    const event = currentApplet.schedule.events.find(({ id }) => id === eventId);
    if (!event) {
      return null;
    }
    return currentApplet.activities.find(activity => activity.schema === event.data.URI);
  }

  openActivityByEventId = (notificationObj) => {
    if (AppState.currentState === 'active') {
      Actions.push('applet_list');
    } else {
      Actions.replace('applet_list');
    }
    // const eventId = _.get(notificationObj, 'notification._data.event_id', '');
    // const appletId = _.get(notificationObj, 'notification._data.applet_id', '');
    // const activityId = _.get(notificationObj, 'notification._data.activity_id', '');
    // // eslint-disable-next-line no-console
    // console.log('openActivityByEventId', { eventId, appletId, activityId });

    // if (eventId && appletId && activityId) {
    //   const currentApplet = this.props.applets.find(applet => applet.id === `applet/${appletId}`);
    //   if (!currentApplet) {
    //     Alert.alert('Applet was not found', 'There is no applet for given id.');
    //     return;
    //   }
    //   let currentActivity = currentApplet.activities.find(activity => activity.id === `activity/${activityId}`);
    //   if (!currentActivity) {
    //     if (Actions.currentScene !== 'applet_list') {
    //       Actions.push('applet_list');
    //     }
    //     this.props.syncTargetApplet(appletId, () => {
    //       currentActivity = this.findActivityById(eventId, currentApplet, activityId);
    //       // eslint-disable-next-line no-console
    //       console.log('findActivityById', { currentActivity });
    //       this.prepareAndOpenActivity(currentApplet, currentActivity, appletId);
    //     });
    //   } else {
    //     this.prepareAndOpenActivity(currentApplet, currentActivity, appletId);
    //   }
    // }
  }

  getMilliseconds = date => (date ? moment(date).toDate().getTime() : 0);

  prepareAndOpenActivity = (currentApplet, currentActivity) => {
    if (!currentActivity) {
      Alert.alert('Activity was not found', 'There is no activity for given id.');
      return;
    }
    // eslint-disable-next-line no-console
    console.log('prepareAndOpenActivity', { currentActivity });
    const isActivityCompleted = this.isActivityCompleted(currentApplet, currentActivity);
    this.props.setCurrentApplet(currentApplet.id);

    if (isActivityCompleted) {
      // eslint-disable-next-line no-console
      console.log(`isActivityCompleted${isActivityCompleted}, display popup: You have already completed ‘${currentActivity.name.en}’`);
      Actions.push('applet_details', { initialTab: 'data' });
      Alert.alert('', `You have already completed ‘${currentActivity.name.en}’`);
      return;
    }
    if (Actions.currentScene === 'applet_details') {
      Actions.replace('applet_details');
    } else {
      Actions.push('applet_details');
    }

    const currentDate = new Date();
    if (currentActivity.lastScheduledTimestamp && currentActivity.lastTimeout) {
      const deltaTime = currentDate.getTime()
        - this.getMilliseconds(currentActivity.lastScheduledTimestamp)
        - currentActivity.lastTimeout;

      if (deltaTime >= 0) {
        const time = moment(currentActivity.lastScheduledTimestamp)
          .format('HH:mm');
        // eslint-disable-next-line no-console
        console.log(`lastScheduledTimestamp: ${currentActivity.lastScheduledTimestamp},  lastTimeout: ${currentActivity.lastTimeout}`,
          'deltaTime:', deltaTime, 'time:', time, 'display popup:',
          `This activity was due at ${time}. If progress was made on the ${currentActivity.name.en}, it was saved but it can no longer be taken today.`);
        Alert.alert('', `This activity was due at ${time}. If progress was made on the ${currentActivity.name.en}, it was saved but it can no longer be taken today.`);
        return;
      }
    }

    let deltaTime = currentDate.getTime()
      - this.getMilliseconds(currentActivity.nextScheduledTimestamp);

    if (currentActivity.nextScheduledTimestamp && moment(currentDate).isBefore(moment(currentActivity.nextScheduledTimestamp), 'day')) {
      // eslint-disable-next-line no-console
      console.log('clear deltaTime');
      deltaTime = 0;
    }

    if (currentActivity.nextAccess || deltaTime >= 0) {
      // eslint-disable-next-line no-console
      console.log('startResponse', 'nextScheduledTimestamp:', currentActivity.nextScheduledTimestamp,
        'nextAccess:', currentActivity.nextAccess, 'deltaTime:', deltaTime);
      this.props.startResponse(currentActivity);
    } else {
      const time = moment(currentActivity.nextScheduledTimestamp)
        .format('HH:mm');
      // eslint-disable-next-line no-console
      console.log('display popup: "Activity not ready"', 'nextScheduledTimestamp:', currentActivity.nextScheduledTimestamp,
        'nextAccess:', currentActivity.nextAccess, 'deltaTime:', deltaTime, 'time:', time);
      Alert.alert('Activity not ready', `You’re not able to start activity yet, ‘${currentActivity.name.en}’ is scheduled to start at ${time} today`);
    }
  };


  initAndroidChannel = async () => {
    if (Platform.OS === 'android') {
      const channel = new firebase.notifications.Android.Channel(
        AndroidChannelId,
        'MindLogger Channel',
        firebase.notifications.Android.Importance.Max,
      ).setDescription('MindLogger Channel');

      // Create the channel
      await firebase.notifications().android.createChannel(channel);
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
    console.log('onNotificationOpened');
    this.openActivityByEventId(notificationOpen);

    // eslint-disable-next-line no-console
    console.log(`FCM[${Platform.OS}]: onNotificationOpened `, notificationOpen);
    if (isIOS) {
      const iconBadgeNumber = await this.updateApplicationIconBadgeNumber();
      this.props.updateBadgeNumber(iconBadgeNumber);
    }
  };

  updateApplicationIconBadgeNumber = async () => {
    const iconBadgeNumber = await this.generateApplicationIconBadgeNumber();
    PushNotificationIOS.setApplicationIconBadgeNumber(iconBadgeNumber);
    return iconBadgeNumber;
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

  isBackgroundState = state => state?.match(/inactive|background/);

  handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const { setAppStatus } = this.props;
    if (this.isBackgroundState(nextAppState) && this.appState === 'active') {
      setAppStatus(false);
      console.log('App is going background');
      if (isIOS) {
        const badgeNumber = await this.updateApplicationIconBadgeNumber();
        updateBadgeNumber(badgeNumber);
      }
    } else if (
      this.isBackgroundState(this.appState)
      && nextAppState === 'active'
    ) {
      setAppStatus(true);
      console.log('App is coming to foreground');
      if (isIOS) {
        const badgeNumber = await this.updateApplicationIconBadgeNumber();
        updateBadgeNumber(badgeNumber);
      }
    }
    this.appState = nextAppState;
  }

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
  setAppStatus: PropTypes.func.isRequired,
  inProgress: PropTypes.object,
  setCurrentApplet: PropTypes.func.isRequired,
  startResponse: PropTypes.func.isRequired,
  updateBadgeNumber: PropTypes.func.isRequired,
  syncTargetApplet: PropTypes.func.isRequired,
};

FireBaseMessaging.defaultProps = {
  inProgress: {},
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  inProgress: inProgressSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setFCMToken: (token) => {
    dispatch(setFcmToken(token));
  },
  setAppStatus: appStatus => dispatch(setAppStatus(appStatus)),
  setCurrentApplet: id => dispatch(setCurrentApplet(id)),
  startResponse: activity => dispatch(startResponse(activity)),
  updateBadgeNumber: badgeNumber => dispatch(updateBadgeNumber(badgeNumber)),
  sync: cb => dispatch(sync(cb)),
  syncTargetApplet: (appletId, cb) => dispatch(syncTargetApplet(appletId, cb)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FireBaseMessaging);
